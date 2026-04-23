import { createServiceRoleClient } from "./service-role";
import { CreemCustomer, CreemSubscription } from "@/types/creem";

export async function createOrUpdateCustomer(
  creemCustomer: CreemCustomer,
  userId: string
) {
  const supabase = createServiceRoleClient();

  // First, try to find existing customer by user_id (preserves existing credits from registration)
  const { data: existingByUserId, error: userIdError } = await supabase
    .from("customers")
    .select()
    .eq("user_id", userId)
    .single();

  if (userIdError && userIdError.code !== "PGRST116") {
    console.error("Error finding customer by user_id:", userIdError);
    throw userIdError;
  }

  // If found by user_id, update with Creem customer info
  if (existingByUserId) {
    console.log("Found existing customer by user_id:", existingByUserId.id);
    const { error } = await supabase
      .from("customers")
      .update({
        creem_customer_id: creemCustomer.id,
        // email: creemCustomer.email, // Don't overwrite email with payment email
        name: creemCustomer.name,
        country: creemCustomer.country,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingByUserId.id);

    if (error) {
      console.error("Error updating customer by user_id:", error);
      throw error;
    }
    console.log(`Updated existing customer ${existingByUserId.id} with Creem info`);
    return existingByUserId.id;
  }

  // Fallback: try to find by creem_customer_id
  const { data: existingByCreemId, error: creemIdError } = await supabase
    .from("customers")
    .select()
    .eq("creem_customer_id", creemCustomer.id)
    .single();

  if (creemIdError && creemIdError.code !== "PGRST116") {
    console.error("Error finding customer by creem_id:", creemIdError);
    throw creemIdError;
  }

  if (existingByCreemId) {
    console.log("Found existing customer by creem_id:", existingByCreemId.id);
    const { error } = await supabase
      .from("customers")
      .update({
        email: creemCustomer.email,
        name: creemCustomer.name,
        country: creemCustomer.country,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingByCreemId.id);

    if (error) throw error;
    return existingByCreemId.id;
  }

  // Create new customer if not found
  const { data: newCustomer, error } = await supabase
    .from("customers")
    .insert({
      user_id: userId,
      creem_customer_id: creemCustomer.id,
      email: creemCustomer.email,
      name: creemCustomer.name,
      country: creemCustomer.country,
      credits: 0, // New customers start with 0, credits will be added separately
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  console.log(`Created new customer ${newCustomer.id}`);
  return newCustomer.id;
}


export async function createOrUpdateSubscription(
  creemSubscription: CreemSubscription,
  customerId: string
) {
  const supabase = createServiceRoleClient();

  const { data: existingSubscription, error: fetchError } = await supabase
    .from("subscriptions")
    .select()
    .eq("creem_subscription_id", creemSubscription.id)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    throw fetchError;
  }

  const subscriptionData = {
    customer_id: customerId,
    creem_product_id:
      typeof creemSubscription?.product === "string"
        ? creemSubscription?.product
        : creemSubscription?.product?.id,
    status: creemSubscription?.status,
    current_period_start: creemSubscription?.current_period_start_date,
    current_period_end: creemSubscription?.current_period_end_date,
    canceled_at: creemSubscription?.canceled_at,
    metadata: creemSubscription?.metadata,
    updated_at: new Date().toISOString(),
  };

  if (existingSubscription) {
    const { error } = await supabase
      .from("subscriptions")
      .update(subscriptionData)
      .eq("id", existingSubscription.id);

    if (error) throw error;
    return existingSubscription.id;
  }

  const { data: newSubscription, error } = await supabase
    .from("subscriptions")
    .insert({
      ...subscriptionData,
      creem_subscription_id: creemSubscription.id,
    })
    .select()
    .single();

  if (error) throw error;
  return newSubscription.id;
}

export async function getUserSubscription(userId: string) {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from("subscriptions")
    .select(
      `
      *,
      customers!inner(user_id)
    `
    )
    .eq("customers.user_id", userId)
    .eq("status", "active")
    .single();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  return data;
}

export async function addCreditsToCustomer(
  customerId: string,
  credits: number,
  creemOrderId?: string,
  description?: string,
  options?: {
    eventId?: string;
    eventType?: string;
    actionKey?: string;
    metadata?: Record<string, any>;
  }
) {
  const supabase = createServiceRoleClient();
  if (options?.eventId && options?.eventType && options?.actionKey) {
    const { data, error } = await supabase.rpc("process_webhook_credit_grant", {
      p_event_id: options.eventId,
      p_event_type: options.eventType,
      p_action_key: options.actionKey,
      p_customer_id: customerId,
      p_credits: credits,
      p_description: description || "Credits purchase",
      p_creem_order_id: creemOrderId ?? null,
      p_metadata: options.metadata ?? {},
    });

    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase.rpc("increase_credits", {
    p_customer_id: customerId,
    p_amount: credits,
    p_description: description || "Credits purchase",
    p_creem_order_id: creemOrderId ?? null,
    p_metadata: options?.metadata ?? {},
  });

  if (error) throw error;
  return data;
}

export async function useCredits(
  customerId: string,
  credits: number,
  description: string
) {
  const supabase = createServiceRoleClient();

  // Start a transaction
  const { data: client } = await supabase
    .from("customers")
    .select("credits")
    .eq("id", customerId)
    .single();
  if (!client) throw new Error("Customer not found");
  if ((client.credits || 0) < credits) throw new Error("Insufficient credits");

  const newCredits = client.credits - credits;

  // Update customer credits
  const { error: updateError } = await supabase
    .from("customers")
    .update({ credits: newCredits, updated_at: new Date().toISOString() })
    .eq("id", customerId);

  if (updateError) throw updateError;

  // Record the transaction in credits_history
  const { error: historyError } = await supabase
    .from("credits_history")
    .insert({
      customer_id: customerId,
      amount: credits,
      type: "subtract",
      description,
    });

  if (historyError) throw historyError;

  return newCredits;
}

export async function getCustomerCredits(customerId: string) {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from("customers")
    .select("credits")
    .eq("id", customerId)
    .single();

  if (error) throw error;
  return data?.credits || 0;
}

export async function getCreditsHistory(customerId: string) {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from("credits_history")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
