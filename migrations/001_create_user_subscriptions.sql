-- Table user_subscriptions : stockage de l'abonnement Stripe par utilisateur
-- Contient les métadonnées nécessaires au suivi d'abonnement et aux limites de messages
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  stripe_price_id text,
  plan_name text NOT NULL DEFAULT 'start' CHECK (plan_name IN ('start', 'scale', 'team')),
  status text NOT NULL DEFAULT 'inactive' CHECK (status IN ('inactive', 'active', 'trialing', 'past_due', 'canceled', 'incomplete', 'unpaid')),
  messages_limit integer NOT NULL DEFAULT 10,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.user_subscriptions IS 'Abonnements Stripe par utilisateur — métadonnées de plan et périodes';
COMMENT ON COLUMN public.user_subscriptions.user_id IS 'Référence vers auth.users — un seul abonnement actif par user';
COMMENT ON COLUMN public.user_subscriptions.stripe_customer_id IS 'Stripe Customer ID — créé lors du premier checkout';
COMMENT ON COLUMN public.user_subscriptions.stripe_subscription_id IS 'Stripe Subscription ID — lié au periodic billing';
COMMENT ON COLUMN public.user_subscriptions.plan_name IS 'Plan : start (10 msg), scale (50 msg), team (100 msg)';
COMMENT ON COLUMN public.user_subscriptions.messages_limit IS 'Limite mensuelle de messages selon le plan';
COMMENT ON COLUMN public.user_subscriptions.status IS 'Statut Stripe — seul service_role peut modifier via webhook';
