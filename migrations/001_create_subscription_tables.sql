-- ============================================================
-- Phase 1 : Création des tables d'abonnement
-- ============================================================

-- Table principale des abonnements Stripe par utilisateur
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Plan et status (colonnes sensibles — non modifiables côté client via RLS)
  plan text NOT NULL DEFAULT 'start' 
    CHECK (plan IN ('start', 'scale', 'team')),
  status text NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'active', 'cancelled', 'past_due', 'trialing')),
  
  -- Limite mensuelle de messages (déduite du plan, non modifiable manuellement)
  messages_limit integer NOT NULL DEFAULT 10
    CHECK (messages_limit > 0),
  
  -- Dates de période de facturation
  current_period_start timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz NOT NULL DEFAULT now() + interval '1 month',
  
  -- IDs Stripe (sensibles — lecture seule client)
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  stripe_price_id text,
  
  -- Timestamps d'audit
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Table de quota messages avec compteur
CREATE TABLE IF NOT EXISTS public.user_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Compteur et limite (messages_limit synchronisé depuis user_subscriptions)
  messages_used integer NOT NULL DEFAULT 0 
    CHECK (messages_used >= 0),
  messages_limit integer NOT NULL DEFAULT 10
    CHECK (messages_limit > 0),
  
  -- Reset mensuel (période en cours pour comparaison avec updated_at)
  period_start timestamptz NOT NULL DEFAULT now(),
  
  -- Timestamps d'audit
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.user_subscriptions IS 'Abonnements Stripe par utilisateur — plan, status, IDs Stripe';
COMMENT ON TABLE public.user_messages IS 'Compteur de messages utilisés par utilisateur pour le quota mensuel';

-- ============================================================
-- Phase 2 : Index pour optimisation des requêtes
-- ============================================================

-- Index sur user_id pour lookup rapide (JOIN auth.users, lecture au login)
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id 
  ON public.user_subscriptions(user_id);

-- Index partiel pour retrouver les comptes en attente d'activation (cleanup, debugging)
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_pending 
  ON public.user_subscriptions(user_id) 
  WHERE status = 'pending';

-- Index sur user_id pour lecture rapide du quota
CREATE INDEX IF NOT EXISTS idx_user_messages_user_id 
  ON public.user_messages(user_id);

-- ============================================================
-- Phase 3 : Activation RLS
-- ============================================================

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_messages ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Phase 4 : Trigger auto-update updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trigger_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER trigger_user_messages_updated_at
  BEFORE UPDATE ON public.user_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
