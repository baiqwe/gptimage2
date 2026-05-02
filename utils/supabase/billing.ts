import { getStripeServerClient } from "@/utils/stripe/server";
import { createServiceRoleClient } from "./service-role";

type StripeClient = ReturnType<typeof getStripeServerClient>;
type StripeCustomer = Exclude<
  Awaited<ReturnType<StripeClient["customers"]["retrieve"]>>,
  { deleted: true }
>;
type StripeSubscription = Awaited<
  ReturnType<StripeClient["subscriptions"]["retrieve"]>
>;

export async function upsertStripeCustomerForUser(
  stripeCustomer: StripeCustomer,
  userId: string
) {
  const supabase = createServiceRoleClient();

  const { data: existingCustomer, error: lookupError } = await supabase
    .from("customers")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (lookupError && lookupError.code !== "PGRST116") {
    throw lookupError;
  }

  const payload = {
    stripe_customer_id: stripeCustomer.id,
    email: stripeCustomer.email || existingCustomer?.email || "no-email@placeholder.com",
    name:
      typeof stripeCustomer.name === "string" && stripeCustomer.name.trim().length > 0
        ? stripeCustomer.name
        : existingCustomer?.name || null,
    country:
      stripeCustomer.address?.country ||
      stripeCustomer.shipping?.address?.country ||
      existingCustomer?.country ||
      null,
    updated_at: new Date().toISOString(),
  };

  if (existingCustomer) {
    const { error } = await supabase
      .from("customers")
      .update(payload)
      .eq("id", existingCustomer.id);

    if (error) throw error;
    return existingCustomer.id as string;
  }

  const { data: insertedCustomer, error: insertError } = await supabase
    .from("customers")
    .insert({
      user_id: userId,
      creem_customer_id: `auto_${userId}`,
      credits: 0,
      metadata: {
        source: "stripe_checkout_autocreate",
      },
      ...payload,
    })
    .select("id")
    .single();

  if (insertError) throw insertError;
  return insertedCustomer.id as string;
}

export async function markCustomerPaidAccess(
  customerId: string,
  provider: "stripe" | "creem"
) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("customers")
    .update({
      has_paid_access: true,
      billing_provider: provider,
      updated_at: new Date().toISOString(),
    })
    .eq("id", customerId);

  if (error) throw error;
}

export async function createOrUpdateStripeSubscription(
  stripeSubscription: StripeSubscription,
  customerId: string
) {
  const supabase = createServiceRoleClient();

  const { data: existingSubscription, error: fetchError } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("stripe_subscription_id", stripeSubscription.id)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    throw fetchError;
  }

  const primaryItem = stripeSubscription.items.data[0];
  const subscriptionData = {
    customer_id: customerId,
    provider: "stripe",
    stripe_price_id: primaryItem?.price?.id || null,
    stripe_product_id:
      typeof primaryItem?.price?.product === "string"
        ? primaryItem.price.product
        : primaryItem?.price?.product?.id || null,
    status: stripeSubscription.status,
    current_period_start: primaryItem?.current_period_start
      ? new Date(primaryItem.current_period_start * 1000).toISOString()
      : new Date().toISOString(),
    current_period_end: primaryItem?.current_period_end
      ? new Date(primaryItem.current_period_end * 1000).toISOString()
      : new Date().toISOString(),
    canceled_at: stripeSubscription.canceled_at
      ? new Date(stripeSubscription.canceled_at * 1000).toISOString()
      : null,
    trial_end: stripeSubscription.trial_end
      ? new Date(stripeSubscription.trial_end * 1000).toISOString()
      : null,
    metadata: stripeSubscription.metadata,
    updated_at: new Date().toISOString(),
  };

  if (existingSubscription) {
    const { error } = await supabase
      .from("subscriptions")
      .update(subscriptionData)
      .eq("id", existingSubscription.id);

    if (error) throw error;
    return existingSubscription.id as string;
  }

  const { data: insertedSubscription, error: insertError } = await supabase
    .from("subscriptions")
    .insert({
      ...subscriptionData,
      creem_subscription_id: `legacy_stripe_${stripeSubscription.id}`,
      creem_product_id: "stripe",
      stripe_subscription_id: stripeSubscription.id,
    })
    .select("id")
    .single();

  if (insertError) throw insertError;
  return insertedSubscription.id as string;
}
