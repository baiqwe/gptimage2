import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { getStripeServerClient } from "@/utils/stripe/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: customerData } = await supabase
      .from("customers")
      .select(
        `
          stripe_customer_id,
          creem_customer_id,
          billing_provider,
          subscriptions (
            provider,
            status,
            current_period_end,
            created_at
          )
        `
      )
      .eq("user_id", user.id)
      .single();

    const activeSubscription = customerData?.subscriptions?.find((subscription: any) =>
      ["active", "trialing", "past_due", "canceled"].includes(subscription.status)
    );

    const provider = activeSubscription?.provider || customerData?.billing_provider;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const referer = request.headers.get("referer");
    const locale = referer?.includes("/zh/") ? "zh" : "en";
    const returnUrl = `${siteUrl}/${locale}/dashboard`;

    if (provider === "stripe" && customerData?.stripe_customer_id) {
      const stripe = getStripeServerClient();
      const session = await stripe.billingPortal.sessions.create({
        customer: customerData.stripe_customer_id,
        return_url: returnUrl,
      });
      return NextResponse.json({ url: session.url, provider: "stripe" });
    }

    if (
      customerData?.creem_customer_id &&
      !customerData.creem_customer_id.startsWith("auto_") &&
      process.env.CREEM_API_URL &&
      process.env.CREEM_API_KEY
    ) {
      const response = await fetch(
        `${process.env.CREEM_API_URL}/customers/${customerData.creem_customer_id}/billing-portal`,
        {
          method: "POST",
          headers: {
            "x-api-key": process.env.CREEM_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ return_url: returnUrl }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        return NextResponse.json(
          { error: "Failed to open Creem billing portal", details: data },
          { status: 500 }
        );
      }

      return NextResponse.json({ url: data.url, provider: "creem" });
    }

    return NextResponse.json(
      { error: "No billing portal available yet" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Billing portal error:", error);
    return NextResponse.json(
      {
        error: "Failed to open billing portal",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
