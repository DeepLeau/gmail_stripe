-- Migration 008 : Policies RLS pour contrôler l'accès aux subscriptions
-- Lecture : utilisateur voit son propre abonnement
-- Écriture : INTERDIT côté client — seules les RPCs (service_role) peuvent modifier
-- Colonnes sensibles (plan, messages_limit, subscription_status) non modifiables côté client

-- Policy SELECT : un utilisateur ne voit que sa propre ligne
CREATE POLICY "users_can_read_own_subscription"
  ON public.user_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy INSERT : INTERDIT côté client
-- Les inscriptions passent par la RPC link_stripe_session (service_role)
-- Pas de policy INSERT créée = opération interdite par défaut

-- Policy UPDATE : INTERDIT côté client
-- USING (false) bloque explicitement tout UPDATE côté client.
-- Les RPCs avec SECURITY DEFINER (apply_subscription_change, link_stripe_session)
-- contournent RLS et peuvent modifier la table.
CREATE POLICY "no_client_update_subscription"
  ON public.user_subscriptions
  FOR UPDATE
  USING (false);

-- Policy DELETE : INTERDIT côté client
-- Pas de policy DELETE créée = opération interdite par défaut
