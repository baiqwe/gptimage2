ALTER TABLE public.generations
    ADD COLUMN IF NOT EXISTS provider text,
    ADD COLUMN IF NOT EXISTS provider_task_id text,
    ADD COLUMN IF NOT EXISTS error_message text,
    ADD COLUMN IF NOT EXISTS completed_at timestamp with time zone,
    ADD COLUMN IF NOT EXISTS refunded_at timestamp with time zone,
    ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL;

UPDATE public.generations
SET updated_at = COALESCE(updated_at, created_at, timezone('utc'::text, now()))
WHERE updated_at IS NULL;

CREATE INDEX IF NOT EXISTS generations_status_idx
    ON public.generations(status);

CREATE INDEX IF NOT EXISTS generations_user_id_created_at_idx
    ON public.generations(user_id, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS generations_provider_task_id_key
    ON public.generations(provider_task_id)
    WHERE provider_task_id IS NOT NULL;

DROP TRIGGER IF EXISTS handle_generations_updated_at ON public.generations;
CREATE TRIGGER handle_generations_updated_at
    BEFORE UPDATE ON public.generations
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE OR REPLACE FUNCTION public.refund_generation_credits(
    p_generation_id uuid,
    p_description text DEFAULT 'Refund: GPT Image 2 Generation Failed',
    p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_generation public.generations%ROWTYPE;
    v_customer_id uuid;
BEGIN
    SELECT *
    INTO v_generation
    FROM public.generations
    WHERE id = p_generation_id
    FOR UPDATE;

    IF v_generation.id IS NULL THEN
        RAISE EXCEPTION 'Generation % not found', p_generation_id;
    END IF;

    IF v_generation.refunded_at IS NOT NULL THEN
        RETURN FALSE;
    END IF;

    IF COALESCE(v_generation.credits_cost, 0) <= 0 THEN
        RETURN FALSE;
    END IF;

    SELECT id
    INTO v_customer_id
    FROM public.customers
    WHERE user_id = v_generation.user_id
    FOR UPDATE;

    IF v_customer_id IS NULL THEN
        RAISE EXCEPTION 'Customer for generation % not found', p_generation_id;
    END IF;

    UPDATE public.customers
    SET credits = credits + v_generation.credits_cost,
        updated_at = NOW()
    WHERE id = v_customer_id;

    INSERT INTO public.credits_history (
        customer_id,
        amount,
        type,
        description,
        created_at,
        metadata
    ) VALUES (
        v_customer_id,
        v_generation.credits_cost,
        'add',
        p_description,
        NOW(),
        COALESCE(p_metadata, '{}'::jsonb) || jsonb_build_object(
            'action', 'generation_refund',
            'generation_id', v_generation.id,
            'provider_task_id', v_generation.provider_task_id
        )
    );

    UPDATE public.generations
    SET refunded_at = NOW(),
        updated_at = NOW()
    WHERE id = v_generation.id;

    RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.refund_generation_credits(uuid, text, jsonb) TO service_role;
