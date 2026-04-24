-- =============================================================================
-- MIGRATION 001: Création de la table user_subscriptions
-- Stocke les abonnements Stripe avec limites de messages par plan
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identifiants utilisateur (un seul abonnement actif par utilisateur)
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Identifiants Stripe
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_session_id text,  -- nullable : créé pré-signup, lié post-signup
  
  -- Plan et limites (non modifiables côté client via RLS)
  plan text NOT NULL DEFAULT 'start' 
    CHECK (plan IN ('start', 'scale', 'team')),
  messages_limit integer NOT NULL DEFAULT 10
    CHECK (messages_limit >= 0),
  messages_used integer NOT NULL DEFAULT 0
    CHECK (messages_used >= 0),
  
  -- Periodes de facturation
  current_period_start timestamptz,
  current_period_end timestamptz,
  
  -- Statut abonnement
  subscription_status text NOT NULL DEFAULT 'inactive'
    CHECK (subscription_status IN ('inactive', 'active', 'trialing', 'past_due', 'canceled', 'unpaid')),
  
  -- Audit
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index unique sur user_id : un seul abonnement par utilisateur
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_subscriptions_user_id
  ON public.user_subscriptions(user_id)
  WHERE user_id IS NOT NULL;

-- Index unique sur stripe_customer_id : permet l'upsert par customer
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer_id
  ON public.user_subscriptions(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- Index unique sur stripe_session_id : permet le linking post-signup
-- PostgreSQL permet plusieurs NULLs dans un index unique (pas de contrainte UNIQUE classique)
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_session_id
  ON public.user_subscriptions(stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

-- Index sur stripe_subscription_id pour les webhooks
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription_id
  ON public.user_subscriptions(stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

-- =============================================================================
-- Trigger auto-update updated_at
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
