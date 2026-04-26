-- Table principale des abonnements utilisateur
-- Rattachement: user_id vers auth.users (ON DELETE CASCADE)
-- Intégration Stripe: customer_id, session_id, subscription_id (voir risque B & C)

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Lien utilisateur (nullable pour flow "paye d'abord, compte après")
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Référence au plan
  plan_slug text NOT NULL REFERENCES public.plans(slug) ON DELETE RESTRICT,

  -- Identifiants Stripe
  stripe_customer_id text UNIQUE,                                   -- ⚠️ Risque B résolu: ajouté pour matching webhook-first
  stripe_session_id text UNIQUE,                                   -- Checkout session → lie le paiement à l'abonnement
  stripe_subscription_id text UNIQUE,                               -- Webhook events → renouvellement, annulation

  -- Statut de l'abonnement
  status text NOT NULL DEFAULT 'inactive'
    CHECK (status IN ('inactive', 'active', 'past_due', 'cancelled', 'trialing')),

  -- Compteur de messages (reset mensuel via webhook)
  messages_limit integer NOT NULL DEFAULT 10,                      -- Copie de plans.messages_limit au moment de l'activation
  messages_used integer NOT NULL DEFAULT 0 CHECK (messages_used >= 0),

  -- Période de facturation (fournie par Stripe webhook)
  current_period_start timestamptz,
  current_period_end timestamptz DEFAULT (now() + interval '1 month'),

  -- Audit
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.subscriptions IS 'Abonnements utilisateur. Colonnes plan/status/limits non modifiables côté client (risque élévation de privilège).';
