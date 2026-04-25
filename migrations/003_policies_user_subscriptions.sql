-- Policies RLS sur user_subscriptions
-- Lecture : l'utilisateur peut voir son propre abonnement (y compris messages_limit)
-- INSERT/UPDATE/DELETE : interdits côté client — seul le service_role (webhook Stripe) peut écrire
-- Ces colonnes critiques ne doivent JAMAIS être modifiables par le client :
--   stripe_customer_id, stripe_subscription_id, plan_name, status, messages_limit,
--   current_period_start, current_period_end, cancel_at_period_end

-- SELECT : lecture du propre abonnement uniquement
CREATE POLICY "users_read_own_subscription"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT : interdit côté client (service_role only via webhook)
-- Pas de policy INSERT = operation interdite par défaut PostgreSQL

-- UPDATE : interdit côté client — aucune modification directe autorisée
-- (WITH CHECK false seul = intention claire, pas de logique fragile de fige-colonnes)
CREATE POLICY "no_client_update_subscription"
  ON public.user_subscriptions FOR UPDATE
  USING (false);

-- DELETE : interdit côté client
CREATE POLICY "no_client_delete_subscription"
  ON public.user_subscriptions FOR DELETE
  USING (false);
