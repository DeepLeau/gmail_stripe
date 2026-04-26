-- Policy SELECT sur pending_subscriptions : lecture si user_id match OU session match current_session_id
-- Condition OR = le user authenticated voit sa ligne, OU l'API lit la session active (via set_config)
-- Note: 'app.current_session_id' doit être set par l'API via supabase.rpc('set_config') avant la query
CREATE POLICY "Users read own pending or api reads current session"
  ON public.pending_subscriptions FOR SELECT
  USING (
    auth.uid() = user_id
    OR stripe_session_id = current_setting('app.current_session_id', true)
  );
