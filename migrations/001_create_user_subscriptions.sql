-- Migration 001: Table des abonnements utilisateurs avec indexes
-- Contrôle d'accès via RLS + RPC functions server-side only

-- Table principale des abonnements
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL CHECK (plan IN ('start', 'scale', 'team')),
  messages_limit integer NOT NULL CHECK (messages_limit >= 0),
  messages_used integer NOT NULL DEFAULT 0 CHECK (messages_used >= 0),
  stripe_session_id text UNIQUE,
  stripe_customer_id text,
  stripe_subscription_id text UNIQUE,
  current_period_end timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index pour jointures rapides par utilisateur
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id
  ON public.user_subscriptions(user_id);

-- Index pour linking post-checkout via session Stripe
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_session_id
  ON public.user_subscriptions(stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

-- Index pour webhooks et upsert via customer Stripe
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer_id
  ON public.user_subscriptions(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- Index pour renouvellements et mises à jour via subscription Stripe
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription_id
  ON public.user_subscriptions(stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

-- Index partiel: un seul abonnement actif par utilisateur
-- Empêche les duplicatas silencieux si le linking race
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_subscriptions_one_per_user
  ON public.user_subscriptions(user_id)
  WHERE user_id IS NOT NULL;

