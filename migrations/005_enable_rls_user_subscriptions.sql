-- =====================================================
-- MIGRATION 05: Enable Row Level Security
-- Prérequis aux policies — les utilisateurs ne voient
-- que leurs propres lignes
-- =====================================================
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.user_subscriptions IS 'RLS enabled for user data isolation.';
