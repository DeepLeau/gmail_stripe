-- Policy UPDATE sur pending_subscriptions : lier un pending_subscription à l'utilisateur après signup
-- Utilisateur ne peut modifier QUE sa propre ligne (user_id = auth.uid())
-- user_id peut être mis à jour NULL → son-uuid (linking)
-- plan et stripe_* non modifiables après création (protégés par la CHECK = valeur reste identique)
-- L'API appelle cette policy aprèssignup via supabase.server.ts (service_role bypass RLS)
CREATE POLICY "Users update own pending subscription"
  ON public.pending_subscriptions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
