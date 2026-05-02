-- Signup abuse guardrails
-- Limit registrations per IP/device across a 24-hour window.

CREATE TABLE IF NOT EXISTS public.signup_attempt_logs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_ip text,
    device_id text,
    user_agent_hash text,
    email_domain text,
    attempted_at timestamptz NOT NULL DEFAULT NOW(),
    outcome text NOT NULL DEFAULT 'attempted',
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS signup_attempt_logs_client_ip_idx
    ON public.signup_attempt_logs (client_ip, attempted_at DESC);

CREATE INDEX IF NOT EXISTS signup_attempt_logs_device_id_idx
    ON public.signup_attempt_logs (device_id, attempted_at DESC);

CREATE INDEX IF NOT EXISTS signup_attempt_logs_email_domain_idx
    ON public.signup_attempt_logs (email_domain, attempted_at DESC);

ALTER TABLE public.signup_attempt_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage signup attempt logs" ON public.signup_attempt_logs;
CREATE POLICY "Service role can manage signup attempt logs"
    ON public.signup_attempt_logs FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

GRANT ALL ON public.signup_attempt_logs TO service_role;

CREATE OR REPLACE FUNCTION public.cleanup_old_signup_attempt_logs(days_to_keep integer DEFAULT 30)
RETURNS integer AS $$
DECLARE
    deleted_count integer;
BEGIN
    DELETE FROM public.signup_attempt_logs
    WHERE attempted_at < NOW() - make_interval(days => days_to_keep);

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.cleanup_old_signup_attempt_logs(integer) TO service_role;
