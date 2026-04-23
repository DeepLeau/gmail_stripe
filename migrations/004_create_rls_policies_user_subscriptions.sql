-- Policy SELECT : user lit uniquement sa propre ligne
CREATE POLICY "Users can read own subscription"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Policy INSERT : interdite côté client (service_role uniquement)
-- Pas de policy INSERT → PostgreSQL interdit par défaut = protection
--CREATE POLICY "No client insert subscription"
--  ON public.user_subscriptions FOR INSERT
--  WITH CHECK (false);

-- Policy UPDATE : interdite côté client (service_role uniquement)
-- Blocage total car toutes les colonnes sont sensibles et modifiées par service_role
CREATE POLICY "No client update subscription"
  ON public.user_subscriptions FOR UPDATE
  USING (false)
  WITH CHECK (false);

-- Policy DELETE : interdite côté client (service_role uniquement)
CREATE POLICY "No client delete subscription"
  ON public.user_subscriptions FOR DELETE
  USING (false);
