-- =============================================================================
-- MIGRATION 004: Activation de RLS sur user_subscriptions
-- =============================================================================

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
