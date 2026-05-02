import { headers } from "next/headers";

import { NextResponse } from "next/server";
import { verifyCreemWebhookSignature } from "@/utils/creem/verify-signature";
import { CreemWebhookEvent } from "@/types/creem";
import {
  createOrUpdateCustomer,
  createOrUpdateSubscription,
  addCreditsToCustomer,
} from "@/utils/supabase/subscriptions";
import { markCustomerPaidAccess } from "@/utils/supabase/billing";

const CREEM_WEBHOOK_SECRET = process.env.CREEM_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  try {
    const body = await request.text();

    const headersList = headers();
    const signature = (await headersList).get("creem-signature") || "";

    // Verify the webhook signature
    if (
      !signature ||
      !(await verifyCreemWebhookSignature(body, signature, CREEM_WEBHOOK_SECRET))
    ) {
      console.error("Invalid webhook signature. Received:", signature, "Expected (calc): see verify logs");
      return new NextResponse("Invalid signature", { status: 401 });
    }

    const event = JSON.parse(body) as CreemWebhookEvent;
    console.log("Received webhook event:", event.eventType, event.object?.id);

    // Handle different event types
    switch (event.eventType) {
      case "checkout.completed":
        await handleCheckoutCompleted(event);
        break;
      case "subscription.active":
        await handleSubscriptionActive(event);
        break;
      case "subscription.paid":
        await handleSubscriptionPaid(event);
        break;
      case "subscription.canceled":
        await handleSubscriptionCanceled(event);
        break;
      case "subscription.expired":
        await handleSubscriptionExpired(event);
        break;
      case "subscription.trialing":
        await handleSubscriptionTrialing(event);
        break;
      default:
        console.log(
          `Unhandled event type: ${event.eventType} ${JSON.stringify(event)}`
        );
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    // Return more specific error information
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Webhook processing failed", details: errorMessage },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(event: CreemWebhookEvent) {
  const checkout = event.object;
  console.log("Processing completed checkout:", checkout);

  try {
    // Validate required data
    if (!checkout.metadata?.user_id) {
      console.error("Missing user_id in checkout metadata:", checkout);
      throw new Error("user_id is required in checkout metadata");
    }

    // Create or update customer
    const customerId = await createOrUpdateCustomer(
      checkout.customer,
      checkout.metadata.user_id
    );

    // If subscription exists, create or update it
    if (checkout.subscription) {
      await createOrUpdateSubscription(checkout.subscription, customerId);
    }

    // Add credits if credits are specified in metadata (for both credits and subscription purchases)
    if (checkout.metadata?.credits) {
      const credits = typeof checkout.metadata.credits === 'string'
        ? parseInt(checkout.metadata.credits)
        : checkout.metadata.credits;

      const actionKey = `checkout_completed:${checkout.order.id}`;
      const creditGranted = await addCreditsToCustomer(
        customerId,
        credits,
        checkout.order.id,
        `Purchased ${credits} credits (${checkout.metadata?.product_type || 'unknown'})`,
        {
          eventId: event.id,
          eventType: event.eventType,
          actionKey,
          metadata: {
            checkout_id: checkout.id,
            order_id: checkout.order.id,
            product_type: checkout.metadata?.product_type || 'unknown',
          },
        }
      );
      if (!creditGranted) {
        console.log(`Skipped duplicate checkout credit grant for action ${actionKey}`);
        return;
      }
      console.log(`Added ${credits} credits to customer ${customerId}`);
    }

    await markCustomerPaidAccess(customerId, "creem");
  } catch (error) {
    console.error("Error handling checkout completed:", error);
    throw error;
  }
}



async function handleSubscriptionActive(event: CreemWebhookEvent) {
  const subscription = event.object;
  console.log("Processing active subscription:", subscription.id);

  try {
    // Create or update customer
    const customerId = await createOrUpdateCustomer(
      subscription.customer as any,
      subscription.metadata?.user_id
    );

    // Create or update subscription
    await createOrUpdateSubscription(subscription, customerId);

    // Note: We typically rely on checkout.completed for initial credits
    // But if that fails, we might want to check here?
    // For now, let's keep it simple to avoid double crediting. 
    // If user reports missing credits, we check logs.
  } catch (error) {
    console.error("Error handling subscription active:", error);
    throw error;
  }
}

async function handleSubscriptionPaid(event: CreemWebhookEvent) {
  const subscription = event.object;
  console.log("Processing paid subscription:", subscription.id);

  try {
    // Update subscription status and period
    const customerId = await createOrUpdateCustomer(
      subscription.customer as any,
      subscription.metadata?.user_id
    );
    await createOrUpdateSubscription(subscription, customerId);
    await markCustomerPaidAccess(customerId, "creem");

    const createdAt = Date.parse(subscription.created_at || "");
    const currentPeriodStart = Date.parse(subscription.current_period_start_date || "");
    const updatedAt = Date.parse(subscription.updated_at || "");
    const isInitialPayment =
      (Number.isFinite(createdAt) &&
        Number.isFinite(currentPeriodStart) &&
        Math.abs(currentPeriodStart - createdAt) < 10 * 60 * 1000) ||
      (Number.isFinite(createdAt) &&
        Number.isFinite(updatedAt) &&
        Math.abs(updatedAt - createdAt) < 10 * 60 * 1000);

    if (isInitialPayment) {
      console.log(`Skipping initial subscription.paid credit grant for ${subscription.id}; checkout.completed owns the first grant.`);
      return;
    }

    // Add credits for renewal (Recurring Payment)
    if (subscription.metadata?.credits) {
      const credits = typeof subscription.metadata.credits === 'string'
        ? parseInt(subscription.metadata.credits)
        : subscription.metadata.credits;

      if (credits > 0) {
        const renewalMarker = subscription.current_period_end_date || subscription.updated_at || subscription.created_at;
        const actionKey = `subscription_paid:${subscription.id}:${renewalMarker}`;
        const creditGranted = await addCreditsToCustomer(
          customerId,
          credits,
          undefined, // We don't have order ID here directly usually, or it's in a different field
          `Subscription renewal credits (${subscription.metadata.product_type || 'subscription'})`,
          {
            eventId: event.id,
            eventType: event.eventType,
            actionKey,
            metadata: {
              subscription_id: subscription.id,
              renewal_marker: renewalMarker,
              product_type: subscription.metadata.product_type || 'subscription',
            },
          }
        );
        if (!creditGranted) {
          console.log(`Skipped duplicate subscription renewal credit grant for action ${actionKey}`);
          return;
        }
        console.log(`Added ${credits} renewal credits to customer ${customerId}`);
      }
    }

  } catch (error) {
    console.error("Error handling subscription paid:", error);
    throw error;
  }
}

async function handleSubscriptionCanceled(event: CreemWebhookEvent) {
  const subscription = event.object;
  console.log("Processing canceled subscription:", subscription);

  try {
    // Update subscription status
    const customerId = await createOrUpdateCustomer(
      subscription.customer as any,
      subscription.metadata?.user_id
    );
    await createOrUpdateSubscription(subscription, customerId);
    await markCustomerPaidAccess(customerId, "creem");
  } catch (error) {
    console.error("Error handling subscription canceled:", error);
    throw error;
  }
}

async function handleSubscriptionExpired(event: CreemWebhookEvent) {
  const subscription = event.object;
  console.log("Processing expired subscription:", subscription);

  try {
    // Update subscription status
    const customerId = await createOrUpdateCustomer(
      subscription.customer as any,
      subscription.metadata?.user_id
    );
    await createOrUpdateSubscription(subscription, customerId);
  } catch (error) {
    console.error("Error handling subscription expired:", error);
    throw error;
  }
}

async function handleSubscriptionTrialing(event: CreemWebhookEvent) {
  const subscription = event.object;
  console.log("Processing trialing subscription:", subscription);

  try {
    // Update subscription status
    const customerId = await createOrUpdateCustomer(
      subscription.customer as any,
      subscription.metadata?.user_id
    );
    await createOrUpdateSubscription(subscription, customerId);
  } catch (error) {
    console.error("Error handling subscription trialing:", error);
    throw error;
  }
}
