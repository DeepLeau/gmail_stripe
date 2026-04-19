-- Migration 004: Policies INSERT/UPDATE/DELETE — verrouillage côté client
-- Ces opérations sont réservées au service_role (webhook Stripe, endpoint serveur)
-- utilisateur ne peut PAS créer/mettre à jour/supprimer son abonnement directement

-- INSERT: utilisateur peut créer sa propre ligne (cas normal: premier paiement)
CREATE POLICY "Users can insert their own subscription"
  ON public.user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: interdiction totale côté client (plan, status, stripe_*, quota)
-- Seul le service_role (webhook Stripe) peut modifier via service_role key
CREATE POLICY "No client update user subscription"
  ON public.user_subscriptions FOR UPDATE
  USING (false);

-- DELETE: interdiction totale côté client
CREATE POLICY "No client delete user subscription"
  ON public.user_subscriptions FOR DELETE
  USING (false);
