-- Activation RLS + policies sur user_subscriptions
-- Les colonnes sensibles (plan_id, subscription_status, stripe_*) ne sont PAS modifiables
-- côté client — seul service_role (webhook Stripe) peut les écrire via grants directs

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- SELECT : utilisateur peut lire son propre abonnement
CREATE POLICY "users_read_own_subscription"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Pas de policy INSERT/UPDATE/DELETE côté client
-- INSERT/UPDATE/DELETE réservés à service_role (bypass RLS) via grants dans migrations/006
