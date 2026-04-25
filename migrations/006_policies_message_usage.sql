-- Policies RLS sur message_usage
-- SELECT : l'utilisateur peut voir son propre compteur (pour afficher les messages restants dans le chat)
-- INSERT/UPDATE/DELETE : interdits côté client — incrémentation gérée uniquement par les API routes serveur

-- SELECT : lecture du propre compteur uniquement
CREATE POLICY "users_read_own_usage"
  ON public.message_usage FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT : interdit côté client (service_role only)
CREATE POLICY "no_client_insert_usage"
  ON public.message_usage FOR INSERT
  WITH CHECK (false);

-- UPDATE : interdit côté client (service_role only — incrémentation messages_used)
CREATE POLICY "no_client_update_usage"
  ON public.message_usage FOR UPDATE
  USING (false);

-- DELETE : interdit côté client
CREATE POLICY "no_client_delete_usage"
  ON public.message_usage FOR DELETE
  USING (false);
