-- Policy SELECT sur user_billing : utilisateur lit uniquement sa propre ligne
-- INSERT/UPDATE/DELETE réservés au service_role (voir migrations suivantes)
CREATE POLICY "Users read own billing"
  ON public.user_billing FOR SELECT
  USING (auth.uid() = user_id);
