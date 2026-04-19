-- Policy SELECT — seul accès client à la table
-- L'utilisateur peut lire son propre plan et quota, rien d'autre
CREATE POLICY "Users read own billing"
  ON public.user_billing FOR SELECT
  USING (auth.uid() = user_id);

-- Pas de policy INSERT — seul le service_role (webhook Stripe) peut créer
-- Pas de policy UPDATE — modifications réservées au service_role (webhooks, endpoint serveur)
-- Pas de policy DELETE — aucun cas légitime côté client
