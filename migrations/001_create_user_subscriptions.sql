-- =====================================================
-- MIGRATION 01: Create user_subscriptions table
-- Table principale pour les abonnements Stripe avec
-- métadonnées de plan et limites de messages.
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_session_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT UNIQUE,
    plan TEXT NOT NULL DEFAULT 'start' CHECK (plan IN ('start', 'scale', 'team')),
    messages_limit INTEGER NOT NULL DEFAULT 10,
    messages_used INTEGER NOT NULL DEFAULT 0,
    subscription_status TEXT NOT NULL DEFAULT 'inactive' CHECK (subscription_status IN ('inactive', 'active', 'past_due', 'canceled')),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.user_subscriptions IS 'Stripe subscription data for message gating — Start/Scale/Team plans with monthly limits.';

-- Colonnes sensibles (plan, subscription_status, messages_limit) non modifiables via UPDATE client
-- → les modifications passent par apply_subscription_change (SECURITY DEFINER / service_role)
