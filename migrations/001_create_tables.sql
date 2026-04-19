-- Création des tables user_subscriptions et message_usage
-- user_subscriptions : abonnements Stripe par utilisateur (1 ligne par user via PK user_id)
-- message_usage : compteur mensuel de messages par utilisateur (1 ligne via PK user_id)

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  user_id             uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id             text NOT NULL DEFAULT 'start' CHECK (plan_id IN ('start', 'scale', 'team')),
  stripe_subscription_id text UNIQUE,
  stripe_customer_id    text UNIQUE,
  stripe_session_id     text,
  subscription_status  text NOT NULL DEFAULT 'inactive' CHECK (subscription_status IN ('inactive', 'active', 'trialing', 'past_due', 'canceled')),
  billing_period       text CHECK (billing_period IN ('monthly', 'yearly')),
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.message_usage (
  user_id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  messages_used   integer NOT NULL DEFAULT 0 CHECK (messages_used >= 0),
  messages_limit  integer NOT NULL DEFAULT 10 CHECK (messages_limit > 0),
  reset_at        timestamptz NOT NULL DEFAULT (date_trunc('month', now() AT TIME ZONE 'UTC') + INTERVAL '1 month'),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CHECK (messages_used <= messages_limit)
);

-- Trigger auto-update updated_at sur user_subscriptions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_message_usage_updated_at
  BEFORE UPDATE ON public.message_usage
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
