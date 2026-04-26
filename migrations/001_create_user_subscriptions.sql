-- ============================================================
-- MIGRATION 001 — Tables user_subscriptions + pending_checkouts
-- Template: guest-subscription-quota
--
-- Stratégie : le webhook `checkout.session.completed` peut arriver AVANT
-- ou APRÈS que l'user crée son compte. Pour gérer les deux cas :
-- - Webhook AVANT signup : insère dans `pending_checkouts` (staging, indexé par session_id)
-- - User crée compte sur /signup?session_id=... : la Server Action linkStripeSessionToUser
--   migre la ligne staging vers user_subscriptions avec le user_id frais.
-- - Webhook APRÈS signup : user_subscriptions existe déjà → UPDATE direct.
-- ============================================================

-- ─── Table principale ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  plan text,
  units_limit integer NOT NULL DEFAULT 0 CHECK (units_limit >= 0),
  units_used integer NOT NULL DEFAULT 0 CHECK (units_used >= 0),
  subscription_status text NOT NULL DEFAULT 'free',
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.touch_user_subscriptions_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_subscriptions_touch_updated_at ON public.user_subscriptions;
CREATE TRIGGER user_subscriptions_touch_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_user_subscriptions_updated_at();

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_customer
  ON public.user_subscriptions(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- Bootstrap : ligne 'free' à la création d'un user
CREATE OR REPLACE FUNCTION public.create_default_subscription_for_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.user_subscriptions (user_id, units_limit, subscription_status)
  VALUES (NEW.id, 0, 'free')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON auth.users;
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_subscription_for_new_user();

-- ─── Table staging pour le flow guest ───────────────────────────────────────
-- Stocke le résultat du checkout AVANT que l'user n'existe.
-- Indexée par stripe_session_id (clé que Stripe renvoie dans le success_url).
CREATE TABLE IF NOT EXISTS public.pending_checkouts (
  stripe_session_id text PRIMARY KEY,
  stripe_customer_id text NOT NULL,
  stripe_subscription_id text,
  plan text NOT NULL,
  customer_email text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  subscription_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  -- linked_user_id est rempli quand linkStripeSessionToUser fait le pont.
  -- On garde la ligne pour traçabilité même après linking.
  linked_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  linked_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_pending_checkouts_customer
  ON public.pending_checkouts(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_pending_checkouts_unlinked
  ON public.pending_checkouts(stripe_session_id)
  WHERE linked_user_id IS NULL;

COMMENT ON TABLE public.pending_checkouts IS
  'Staging table for guest-flow checkouts. Webhook writes here BEFORE user signup. linkStripeSessionToUser migrates the data to user_subscriptions on signup completion.';
