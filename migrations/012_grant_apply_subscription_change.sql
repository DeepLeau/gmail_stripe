-- =====================================================
-- MIGRATION 12: Grant execute on apply_subscription_change
-- Réservé au service_role uniquement (webhook handler Stripe).
-- =====================================================
GRANT EXECUTE ON FUNCTION public.apply_subscription_change(
    TEXT, TEXT, TEXT, TEXT, INTEGER, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, BOOLEAN
)
TO service_role;

COMMENT ON GRANT IS
    'Allow service_role to call apply_subscription_change (webhook handler only).
     SECURITY DEFINER bypasses RLS, so only server-side webhooks should invoke.
     NEVER grant to authenticated — that would allow any user to modify
     their own plan, status, and limits without Stripe verification.';
