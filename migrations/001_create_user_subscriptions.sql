-- Migration 001: Création de la table public.user_subscriptions
-- Table centrale du système de facturation pour les plans Start/Scale/Team
-- Les colonnes stripe_* sont nullable pour gérer l'état pending avant webhook

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  -- Identifiants
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Plan et statut (colonnes sensibles — lecture seule côté client)
  plan text NOT NULL DEFAULT 'start' CHECK (plan IN ('start', 'scale', 'team')),
  subscription_status text NOT NULL DEFAULT 'pending' CHECK (subscription_status IN ('pending', 'active', 'cancelled', 'expired', 'past_due')),
  
  -- Réferences Stripe (nullable en pending, Stripe webhook remplit après paiement)
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_session_id text,
  
  -- Quota messages (start: 10, scale: 50, team: 100)
  messages_limit integer NOT NULL DEFAULT 10 CHECK (messages_limit >= 0),
  messages_used integer NOT NULL DEFAULT 0 CHECK (messages_used >= 0),
  
  -- Période de facturation mensuelle
  current_period_start timestamptz,
  current_period_end timestamptz,
  
  -- Audit
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index pour requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(subscription_status) WHERE subscription_status IN ('active', 'pending');
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_period_end ON public.user_subscriptions(current_period_end) WHERE current_period_end IS NOT NULL;

-- Trigger pour updated_at automatique
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_user_subscriptions_updated_at ON public.user_subscriptions;
CREATE TRIGGER on_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
