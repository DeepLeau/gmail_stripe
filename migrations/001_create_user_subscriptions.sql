-- Migration 001 : Table principale pour stocker les abonnements Stripe des utilisateurs
-- Cette table est le seul point de vérité pour le plan et les quotas par utilisateur
-- Toutes les colonnes sont nullable car le linking webhook/signup peut être non-déterministe

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  -- Clé primaire
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Liens utilisateur et Stripe
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id text,
  stripe_subscription_id text UNIQUE,
  session_id text,
  
  -- Plan et quotas — colonnes SENSIBLES (non modifiables côté client)
  plan text NOT NULL DEFAULT 'start' 
    CHECK (plan IN ('start', 'scale', 'team')),
  messages_limit integer NOT NULL DEFAULT 10,
  messages_used integer NOT NULL DEFAULT 0,
  
  -- Période de facturation
  current_period_start timestamptz,
  current_period_end timestamptz,
  
  -- Statut abonnement — colonne SENSIBLE (non modifiable côté client)
  subscription_status text NOT NULL DEFAULT 'inactive'
    CHECK (subscription_status IN ('inactive', 'active', 'trialing', 'past_due', 'canceled', 'unpaid')),
  
  -- Audit
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Trigger auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.user_subscriptions;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
