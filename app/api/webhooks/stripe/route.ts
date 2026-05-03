import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripeServerClient } from "@/utils/stripe/server";
import {
  ensureLocalCustomerForUser,
  createOrUpdateStripeSubscription,
  markCustomerPaidAccess,
  upsertStripeCustomerForUser,
} from "@/utils/supabase/billing";
import { addCreditsToCustomer } from "@/utils/supabase/subscriptions";
import { getPlanById, getPlanByStripePriceId } from "@/config/pricing";

type StripeClient = ReturnType<typeof getStripeServerClient>;
type StripeCheckoutSession = Awaited<ReturnType<StripeClient["checkout"]["sessions"]["retrieve"]>>;
type StripeInvoice = Awaited<ReturnType<StripeClient["invoices"]["retrieve"]>>;
type StripeSubscription = Awaited<ReturnType<StripeClient["subscriptions"]["retrieve"]>>;
type StripeCustomerResponse = Awaited<ReturnType<StripeClient["customers"]["retrieve"]>>;
type StripeCustomerRecord = Exclude<StripeCustomerResponse, { deleted: true }>;

export async function POST(request: Request) {
  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: "STRIPE_WEBHOOK_SECRET is not configured" },
        { status: 500 }
      );
    }

    const stripe = getStripeServerClient();
    const body = await request.text();
    const signature = (await headers()).get("stripe-signature");

    if (!signature) {
      return new NextResponse("Missing stripe signature", { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object as StripeCheckoutSession);
        break;
      case "invoice.paid":
        await handleInvoicePaid(event.data.object as StripeInvoice, event.id, event.type);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await handleSubscriptionChanged(event.data.object as StripeSubscription);
        break;
      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      {
        error: "Stripe webhook processing failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function getStripeCustomer(customerId: string) {
  const stripe = getStripeServerClient();
  const customer = await stripe.customers.retrieve(customerId);
  if (customer.deleted) {
    throw new Error(`Stripe customer ${customerId} is deleted`);
  }
  return customer as StripeCustomerRecord;
}

async function handleCheckoutSessionCompleted(session: StripeCheckoutSession) {
  const userId = session.metadata?.user_id;
  if (!userId) {
    throw new Error("Stripe checkout session is missing metadata.user_id");
  }

  const stripeCustomerId =
    typeof session.customer === "string" ? session.customer : null;
  const fallbackEmail =
    session.customer_email ||
    session.customer_details?.email ||
    session.metadata?.user_email ||
    undefined;

  const customerId = stripeCustomerId
    ? await upsertStripeCustomerForUser(
        await getStripeCustomer(stripeCustomerId),
        userId
      )
    : await ensureLocalCustomerForUser(userId, fallbackEmail);

  await markCustomerPaidAccess(customerId, "stripe");

  if (session.mode === "subscription" && session.subscription && typeof session.subscription === "string") {
    const stripe = getStripeServerClient();
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    await createOrUpdateStripeSubscription(subscription, customerId);
    return;
  }

  if (session.mode === "payment" && session.payment_status === "paid") {
    const planId = session.metadata?.plan_id;
    const plan = planId ? getPlanById(planId) : undefined;
    const credits = Number(session.metadata?.credits || plan?.credits || 0);

    if (credits > 0) {
      const actionKey = `stripe_checkout_completed:${session.id}`;
      const creditGranted = await addCreditsToCustomer(
        customerId,
        credits,
        undefined,
        `Purchased ${credits} credits (stripe)`,
        {
          eventId: session.id,
          eventType: "checkout.session.completed",
          actionKey,
          metadata: {
            provider: "stripe",
            plan_id: planId || null,
            checkout_session_id: session.id,
            payment_intent: typeof session.payment_intent === "string" ? session.payment_intent : null,
          },
        }
      );

      if (!creditGranted) {
        console.log(`Skipped duplicate Stripe checkout grant for ${actionKey}`);
      }
    }
  }
}

async function handleInvoicePaid(invoice: StripeInvoice, eventId: string, eventType: string) {
  const subscriptionId = invoice.parent?.subscription_details?.subscription;
  if (!subscriptionId || typeof subscriptionId !== "string") {
    return;
  }

  if (!invoice.customer || typeof invoice.customer !== "string") {
    throw new Error("Stripe invoice is missing customer id");
  }

  const stripe = getStripeServerClient();
  const stripeCustomer = await getStripeCustomer(invoice.customer);
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata?.user_id;

  if (!userId) {
    throw new Error(`Stripe subscription ${subscription.id} is missing metadata.user_id`);
  }

  const customerId = await upsertStripeCustomerForUser(stripeCustomer, userId);
  await createOrUpdateStripeSubscription(subscription, customerId);
  await markCustomerPaidAccess(customerId, "stripe");

  const firstLine = invoice.lines.data[0];
  const stripePriceId =
    typeof firstLine?.pricing?.price_details?.price === "string"
      ? firstLine.pricing.price_details.price
      : firstLine?.pricing?.price_details?.price?.id || null;
  const plan = stripePriceId ? getPlanByStripePriceId(stripePriceId) : undefined;
  const credits = Number(subscription.metadata?.credits || plan?.credits || 0);

  if (credits <= 0) {
    return;
  }

  const actionKey = `stripe_invoice_paid:${invoice.id}`;
  const creditGranted = await addCreditsToCustomer(
    customerId,
    credits,
    undefined,
    `Subscription credits (${plan?.id || "stripe_subscription"})`,
    {
      eventId,
      eventType,
      actionKey,
      metadata: {
        provider: "stripe",
        invoice_id: invoice.id,
        stripe_subscription_id: subscription.id,
        stripe_price_id: stripePriceId,
        plan_id: plan?.id || subscription.metadata?.plan_id || null,
      },
    }
  );

  if (!creditGranted) {
    console.log(`Skipped duplicate Stripe invoice grant for ${actionKey}`);
  }
}

async function handleSubscriptionChanged(subscription: StripeSubscription) {
  if (!subscription.customer || typeof subscription.customer !== "string") {
    throw new Error("Stripe subscription is missing customer id");
  }

  const userId = subscription.metadata?.user_id;
  if (!userId) {
    console.log(`Skipping Stripe subscription sync for ${subscription.id} because metadata.user_id is missing`);
    return;
  }

  const stripeCustomer = await getStripeCustomer(subscription.customer);
  const customerId = await upsertStripeCustomerForUser(stripeCustomer, userId);
  await createOrUpdateStripeSubscription(subscription, customerId);
}
