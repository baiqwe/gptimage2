-- ============================================
-- Add Stripe as primary billing provider while keeping Creem fallback support
-- ============================================

ALTER TABLE public.customers
    ADD COLUMN IF NOT EXISTS stripe_customer_id text,
    ADD COLUMN IF NOT EXISTS has_paid_access boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS billing_provider text;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'customers_billing_provider_check'
    ) THEN
        ALTER TABLE public.customers
            ADD CONSTRAINT customers_billing_provider_check
            CHECK (billing_provider IS NULL OR billing_provider IN ('stripe', 'creem'));
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS customers_stripe_customer_id_idx
    ON public.customers(stripe_customer_id)
    WHERE stripe_customer_id IS NOT NULL;

UPDATE public.customers
SET
    has_paid_access = CASE
        WHEN has_paid_access THEN true
        WHEN creem_customer_id IS NOT NULL AND creem_customer_id NOT LIKE 'auto_%' THEN true
        ELSE false
    END,
    billing_provider = CASE
        WHEN billing_provider IS NOT NULL THEN billing_provider
        WHEN creem_customer_id IS NOT NULL AND creem_customer_id NOT LIKE 'auto_%' THEN 'creem'
        ELSE billing_provider
    END
WHERE
    has_paid_access = false
    OR billing_provider IS NULL;

ALTER TABLE public.subscriptions
    ADD COLUMN IF NOT EXISTS provider text NOT NULL DEFAULT 'creem',
    ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
    ADD COLUMN IF NOT EXISTS stripe_price_id text,
    ADD COLUMN IF NOT EXISTS stripe_product_id text;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'subscriptions_provider_check'
    ) THEN
        ALTER TABLE public.subscriptions
            ADD CONSTRAINT subscriptions_provider_check
            CHECK (provider IN ('stripe', 'creem'));
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_stripe_subscription_id_idx
    ON public.subscriptions(stripe_subscription_id)
    WHERE stripe_subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS subscriptions_provider_idx
    ON public.subscriptions(provider);

-- Broaden the status constraint so Stripe's lifecycle values are accepted too.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'subscriptions_status_check'
    ) THEN
        ALTER TABLE public.subscriptions DROP CONSTRAINT subscriptions_status_check;
    END IF;
END $$;

ALTER TABLE public.subscriptions
    ADD CONSTRAINT subscriptions_status_check
    CHECK (status IN (
        'incomplete',
        'incomplete_expired',
        'expired',
        'active',
        'past_due',
        'canceled',
        'unpaid',
        'paused',
        'trialing'
    ));
