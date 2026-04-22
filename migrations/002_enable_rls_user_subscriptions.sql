-- Migration 002: Activation RLS + policies sur user_subscriptions
-- SELECT côté client (lecture propre abonnement)
-- INSERT/UPDATE/DELETE: interdiction totale - writes via RPC functions uniquement

-- Activation Row Level Security
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy SELECT: utilisateur lit uniquement son propre abonnement
CREATE POLICY "Users can view own subscription"
  ON public.user_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy INSERT: interdite côté client (via RPC apply_subscription_change uniquement)
-- Pas de policy INSERT = operation interdite par défaut PostgreSQL
-- Ce commentaire documente l'intention: aucun INSERT direct client
-- CREATE POLICY "Service role only can insert subscription" -- intentionally omitted

-- Policy UPDATE: interdite côté client (plan/role sensibles)
-- La fonction decrement_message_count utilise SECURITY DEFINER pour bypass
CREATE POLICY "No direct updates by clients"
  ON public.user_subscriptions FOR UPDATE
  USING (false);

-- Policy DELETE: interdite côté client
CREATE POLICY "No direct deletes by clients"
  ON public.user_subscriptions FOR DELETE
  USING (false);
