import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getPlanById, getStripePriceId } from "@/config/pricing";
import { getStripeServerClient } from "@/utils/stripe/server";

type CheckoutRequestBody = {
  planId?: string;
  locale?: string;
  returnPath?: string;
  source?: "pricing" | "quick_refill";
};

export async function POST(request: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      return NextResponse.json(
        {
          error: "Stripe is not configured",
          code: "STRIPE_CONFIG_MISSING",
        },
        { status: 500 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as CheckoutRequestBody;
    const plan = body.planId ? getPlanById(body.planId) : undefined;

    if (!plan) {
      return NextResponse.json(
        { error: "Unknown plan", code: "PLAN_NOT_FOUND" },
        { status: 400 }
      );
    }

    const stripePriceId = getStripePriceId(plan.id);
    if (!stripePriceId) {
      return NextResponse.json(
        {
          error: "Stripe price is not configured for this plan",
          code: "STRIPE_PRICE_MISSING",
          planId: plan.id,
        },
        { status: 500 }
      );
    }

    const { data: customer } = await supabase
      .from("customers")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    const stripe = getStripeServerClient();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const locale = body.locale === "zh" ? "zh" : "en";
    const normalizedReturnPath =
      body.returnPath && body.returnPath.startsWith("/") ? body.returnPath : `/${locale}/create`;
    const returnUrl = new URL(baseUrl);
    returnUrl.pathname = normalizedReturnPath;
    returnUrl.searchParams.set("checkout", "success");
    returnUrl.searchParams.set("provider", "stripe");
    returnUrl.searchParams.set("plan", plan.id);

    const metadata = {
      user_id: user.id,
      user_email: user.email || "",
      plan_id: plan.id,
      product_type: plan.type === "subscription" ? "subscription" : "credits",
      credits: String(plan.credits),
      source: body.source || "pricing",
    };

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded_page",
      mode: plan.type === "subscription" ? "subscription" : "payment",
      return_url: returnUrl.toString(),
      client_reference_id: user.id,
      customer: customer?.stripe_customer_id || undefined,
      customer_email: customer?.stripe_customer_id ? undefined : user.email || undefined,
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      metadata,
      ...(plan.type === "subscription"
        ? {
            subscription_data: {
              metadata,
            },
          }
        : {}),
    });

    if (!session.client_secret) {
      return NextResponse.json(
        { error: "Stripe checkout did not return a client secret", code: "STRIPE_CLIENT_SECRET_MISSING" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      clientSecret: session.client_secret,
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      {
        error: "Failed to initialize Stripe checkout",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
