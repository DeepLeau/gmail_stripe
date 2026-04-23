-- =====================================================
-- MIGRATION 06: RLS policy — SELECT
-- Utilisateurs authentifiés lisent uniquement leurs
-- propres lignes (badge, header, RPCs)
-- =====================================================
CREATE POLICY user_subscriptions_authenticated_select
ON public.user_subscriptions
FOR SELECT
USING (
    auth.uid() = user_id
    AND auth.role() = 'authenticated'
);

COMMENT ON POLICY user_subscriptions_authenticated_select ON public.user_subscriptions IS
    'Allow authenticated users to SELECT their own subscription rows.';
