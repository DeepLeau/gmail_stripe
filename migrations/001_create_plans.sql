-- Table de référence pour les plans tarifaires (lecture seule côté client)
--风险: aucune (nouvelle table, catalogue statique)

CREATE TABLE IF NOT EXISTS public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,                          -- "Start", "Scale", "Team"
  slug text NOT NULL UNIQUE,                    -- "start", "scale", "team"
  description text,
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  billing_period text NOT NULL DEFAULT 'monthly' CHECK (billing_period IN ('monthly', 'yearly')),
  messages_limit integer NOT NULL CHECK (messages_limit > 0),  -- msg/mois
  is_active boolean NOT NULL DEFAULT true,
  stripe_price_id text,                        -- Placeholder: à remplacer après création dans dashboard Stripe
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index pour recherche par slug (checkout)
CREATE UNIQUE INDEX IF NOT EXISTS idx_plans_slug ON public.plans(slug);

-- Index pour recherche par price_id (webhook)
CREATE INDEX IF NOT EXISTS idx_plans_stripe_price_id ON public.plans(stripe_price_id) WHERE stripe_price_id IS NOT NULL;

COMMENT ON TABLE public.plans IS 'Catalogue des plans tarifaires. Lecture seule côté client.';
