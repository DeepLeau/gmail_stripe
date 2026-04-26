-- Policies sur chat_usage : utilisateur gère uniquement sa propre usage
-- INSERT : nouveau mois ou premier message → utilisateur peut créer sa ligne
-- SELECT : lire son propre usage
-- UPDATE : incrémenter messages_used
-- Note: DELETE interdit côté client (cleanup admin uniquement via service_role)

CREATE POLICY "Users insert own chat usage"
  ON public.chat_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read own chat usage"
  ON public.chat_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own chat usage"
  ON public.chat_usage FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE explicitement interdit côté client (service_role only)
CREATE POLICY "Only service role can delete chat usage"
  ON public.chat_usage FOR DELETE
  USING (false);
