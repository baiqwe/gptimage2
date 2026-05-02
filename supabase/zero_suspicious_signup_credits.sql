-- Zero out known suspicious signup-abuse accounts.
-- Run this manually in Supabase SQL editor after reviewing the domain list.

WITH suspicious_customers AS (
    SELECT id, user_id, email, credits
    FROM public.customers
    WHERE lower(email) LIKE '%@drafterplus.nl'
      AND credits > 0
),
updated AS (
    UPDATE public.customers c
    SET
        credits = 0,
        updated_at = NOW(),
        metadata = COALESCE(c.metadata, '{}'::jsonb) || jsonb_build_object(
            'abuse_flagged', true,
            'abuse_flagged_at', NOW(),
            'abuse_reason', 'suspected_trial_abuse_domain'
        )
    FROM suspicious_customers s
    WHERE c.id = s.id
    RETURNING c.id, c.user_id, c.email, s.credits AS previous_credits
)
INSERT INTO public.credits_history (
    customer_id,
    amount,
    type,
    description,
    created_at,
    metadata
)
SELECT
    u.id,
    u.previous_credits,
    'subtract',
    'Abuse mitigation: suspicious signup credits revoked',
    NOW(),
    jsonb_build_object(
        'source', 'manual_abuse_cleanup',
        'email', u.email,
        'reason', 'suspected_trial_abuse_domain'
    )
FROM updated u;
