-- Table principale pour les abonnements Stripe
-- user_id nullable pour gérer le cas webhook → signup order
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_session_id text,
  plan text NOT NULL DEFAULT 'start' CHECK (plan IN ('start', 'scale', 'team')),
  messages_limit integer NOT NULL,
  messages_used integer NOT NULL DEFAULT 0 CHECK (messages_used >= 0),
  current_period_start timestamptz,
  current_period_end timestamptz,
  subscription_status text NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'trialing', 'past_due', 'canceled', 'incomplete')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

-- Index unique partiel sur user_id : un seul abonnement par user
-- (évite les lignes dupliquées via webhooks concurrents ou appels multiples)
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_subscriptions_user_id
  ON public.user_subscriptions(user_id)
  WHERE user_id IS NOT NULL;

-- Index unique partiel sur stripe_customer_id (permet plusieurs NULL pour pre-signup)
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer
  ON public.user_subscriptions(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- Index unique partiel sur stripe_session_id (permet plusieurs NULL pour pre-signup)
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_session
  ON public.user_subscriptions(stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

-- Trigger automatique pour updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER set_updated_at
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
