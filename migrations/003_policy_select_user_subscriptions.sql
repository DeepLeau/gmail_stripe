-- Migration 003: Policy SELECT — l'utilisateur peut lire son propre abonnement
-- Permet au client d'afficher le plan et les messages restants dans l'UI

CREATE POLICY "Users can read their own subscription"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);
