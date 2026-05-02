import { createClient } from "@/utils/supabase/server";

export class CreditError extends Error {
    code: string;
    constructor(message: string, code: 'INSUFFICIENT_CREDITS' | 'USER_NOT_FOUND' | 'DB_ERROR' = 'DB_ERROR') {
        super(message);
        this.code = code;
    }
}

export async function getUserCredits(userId: string) {
    const supabase = await createClient();

    const { data: customer, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            // Customer not found, try to create one if user exists in Auth
            const { data: { user } } = await supabase.auth.getUser();

            if (user && user.id === userId && user.email) {
                const { data: newCustomer, error: createError } = await supabase
                    .from('customers')
                    .insert({
                        user_id: userId,
                        email: user.email,
                        credits: 0,
                        creem_customer_id: `auto_${userId}`,
                        metadata: {
                            source: 'auto_recovery',
                            initial_credits: 0,
                            recovered_at: new Date().toISOString(),
                            note: 'Recovered missing customer without reissuing signup bonus'
                        }
                    })
                    .select()
                    .single();

                if (!createError && newCustomer) {
                    return { credits: newCustomer.credits, customer: newCustomer };
                } else {
                    // Fail silently but safely defaults will be returned
                }
            }

            return { credits: 0, customer: null };
        }
        throw new CreditError(error.message);
    }

    return { credits: customer.credits, customer };
}

export async function deductCredits(userId: string, amount: number, description: string) {
    const supabase = await createClient();
    const { data: success, error: rpcError } = await supabase.rpc('decrease_credits', {
        p_user_id: userId,
        p_amount: amount,
        p_description: description
    });

    if (rpcError) {
        throw new CreditError(rpcError.message);
    }

    if (!success) {
        throw new CreditError('Insufficient credits', 'INSUFFICIENT_CREDITS');
    }

    const { data: customer, error: fetchError } = await supabase
        .from('customers')
        .select('credits')
        .eq('user_id', userId)
        .single();

    if (fetchError || !customer) {
        throw new CreditError('User record not found', 'USER_NOT_FOUND');
    }

    return customer.credits;
}

export async function addCredits(userId: string, amount: number, description: string) {
    const supabase = await createClient();

    const { data: customer, error: fetchError } = await supabase
        .from('customers')
        .select('id, credits')
        .eq('user_id', userId)
        .single();

    if (fetchError || !customer) {
        throw new CreditError('User record not found', 'USER_NOT_FOUND');
    }

    const { data: newBalance, error: rpcError } = await supabase.rpc('increase_credits', {
        p_customer_id: customer.id,
        p_amount: amount,
        p_description: description,
        p_creem_order_id: null,
        p_metadata: { operation: 'add' }
    });

    if (rpcError) {
        throw new CreditError(rpcError.message);
    }

    return newBalance;
}
