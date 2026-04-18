-- ============================================
-- Migration 001: Création table profiles
-- Stocker les abonnements et quotas utilisateurs
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  plan TEXT NOT NULL DEFAULT 'free',
  messages_count INTEGER NOT NULL DEFAULT 0,
  messages_limit INTEGER NOT NULL DEFAULT 0,
  renewal_date TIMESTAMPTZ,
  subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_plan CHECK (plan IN ('free', 'start', 'scale', 'team')),
  CONSTRAINT messages_within_limit CHECK (messages_count <= messages_limit),
  CONSTRAINT messages_count_positive CHECK (messages_count >= 0)
);

-- Commentaires de documentation
COMMENT ON TABLE public.profiles IS 'Profils utilisateurs avec quotas et abonnements Stripe';
COMMENT ON COLUMN public.profiles.plan IS 'Plan dabonnement: free, start, scale, team';
COMMENT ON COLUMN public.profiles.messages_count IS 'Compteur de messages consommés ce mois';
COMMENT ON COLUMN public.profiles.messages_limit IS 'Limite mensuelle selon le plan';
COMMENT ON COLUMN public.profiles.renewal_date IS 'Date de renouvellement mensuel (NULL pour free)';
COMMENT ON COLUMN public.profiles.subscription_id IS 'ID abonnement Stripe (NULL pour free tier)';
