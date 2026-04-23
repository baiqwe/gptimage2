-- ============================================
-- Migration: Webhook idempotency + atomic credit grants
-- ============================================

CREATE TABLE IF NOT EXISTS public.processed_webhooks (
    id uuid primary key default uuid_generate_v4(),
    event_id text,
    event_type text not null,
    action_key text not null,
    processed_at timestamp with time zone default timezone('utc'::text, now()) not null,
    metadata jsonb default '{}'::jsonb not null
);

CREATE UNIQUE INDEX IF NOT EXISTS processed_webhooks_action_key_idx
    ON public.processed_webhooks(action_key);

ALTER TABLE public.processed_webhooks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage processed webhooks" ON public.processed_webhooks;
CREATE POLICY "Service role can manage processed webhooks"
    ON public.processed_webhooks FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION public.increase_credits(
    p_customer_id uuid,
    p_amount integer,
    p_description text DEFAULT 'Credits added',
    p_creem_order_id text DEFAULT NULL,
    p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_new_credits integer;
BEGIN
    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Credit increase amount must be positive';
    END IF;

    UPDATE public.customers
    SET
        credits = credits + p_amount,
        updated_at = NOW()
    WHERE id = p_customer_id
    RETURNING credits INTO v_new_credits;

    IF v_new_credits IS NULL THEN
        RAISE EXCEPTION 'Customer not found';
    END IF;

    INSERT INTO public.credits_history (
        customer_id,
        amount,
        type,
        description,
        creem_order_id,
        created_at,
        metadata
    ) VALUES (
        p_customer_id,
        p_amount,
        'add',
        p_description,
        p_creem_order_id,
        NOW(),
        COALESCE(p_metadata, '{}'::jsonb)
    );

    RETURN v_new_credits;
END;
$$;

CREATE OR REPLACE FUNCTION public.process_webhook_credit_grant(
    p_event_id text,
    p_event_type text,
    p_action_key text,
    p_customer_id uuid,
    p_credits integer,
    p_description text,
    p_creem_order_id text DEFAULT NULL,
    p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_new_credits integer;
BEGIN
    IF p_credits <= 0 THEN
        RAISE EXCEPTION 'Webhook credits must be positive';
    END IF;

    INSERT INTO public.processed_webhooks (
        event_id,
        event_type,
        action_key,
        metadata
    ) VALUES (
        p_event_id,
        p_event_type,
        p_action_key,
        COALESCE(p_metadata, '{}'::jsonb)
    )
    ON CONFLICT (action_key) DO NOTHING;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    UPDATE public.customers
    SET
        credits = credits + p_credits,
        updated_at = NOW()
    WHERE id = p_customer_id
    RETURNING credits INTO v_new_credits;

    IF v_new_credits IS NULL THEN
        RAISE EXCEPTION 'Customer not found';
    END IF;

    INSERT INTO public.credits_history (
        customer_id,
        amount,
        type,
        description,
        creem_order_id,
        created_at,
        metadata
    ) VALUES (
        p_customer_id,
        p_credits,
        'add',
        p_description,
        p_creem_order_id,
        NOW(),
        jsonb_strip_nulls(
            COALESCE(p_metadata, '{}'::jsonb) ||
            jsonb_build_object(
                'event_id', p_event_id,
                'event_type', p_event_type,
                'action_key', p_action_key
            )
        )
    );

    RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increase_credits(uuid, integer, text, text, jsonb) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.process_webhook_credit_grant(text, text, text, uuid, integer, text, text, jsonb) TO authenticated, service_role;
