-- ============================================
-- Migration 001: Catalogue des plans d'abonnement
-- ============================================
-- Table en lecture seule côté client (pricing page).
-- Les écritures (plans créés par l'admin) passent par le service_role uniquement.
-- Risque: aucun (données catalogue, pas de user_id)

-- Table des plans
CREATE TABLE IF NOT EXISTS public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,                                          -- 'start' | 'scale' | 'team'
  slug text NOT NULL UNIQUE,                                   -- URL-friendly identifier
  description text,
  price_cents integer NOT NULL CHECK (price_cents >= 0),      -- Prix en centimes (0 = free tier)
  currency text NOT NULL DEFAULT 'EUR' CHECK (currency ~ '^[A-Z]{3}$'),  -- ISO 4217
  stripe_price_id text UNIQUE,                                 -- ID Price Stripe (nullable pour dev)
  stripe_price_id_monthly text UNIQUE,                        -- Price ID formule mensuel
  messages_per_month integer NOT NULL CHECK (messages_per_month > 0),  -- Quota mensuel
  features jsonb NOT NULL DEFAULT '[]'::jsonb,                -- Liste des features (ex: ["API access", "Priority support"])
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index pour lookup rapide par slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_plans_slug ON public.plans(lower(slug));

-- Index pour lookup par stripe_price_id (liaison Stripe → plan)
CREATE UNIQUE INDEX IF NOT EXISTS idx_plans_stripe_price_id ON public.plans(stripe_price_id) WHERE stripe_price_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_plans_stripe_price_monthly ON public.plans(stripe_price_id_monthly) WHERE stripe_price_id_monthly IS NOT NULL;

-- Activer RLS (pas de user_id direct, mais bonne pratique pour uniformity)
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Policy: lecture publique (pricing page visible par tous, même non-auth)
-- Note: pas de policy INSERT/UPDATE/DELETE — réservé admin/service_role uniquement
CREATE POLICY "Anyone can read plans catalog"
  ON public.plans FOR SELECT
  USING (true);

-- Trigger pour updated_at automatique
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER plans_updated_at
  BEFORE UPDATE ON public.plans
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
