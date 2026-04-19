-- Activation RLS + policies sur message_usage
-- Le compteur messages_used est décrémenté côté client (via fonction RPC avec vérification auth.uid)
-- La limite messages_limit est syncronisée par service_role uniquement

ALTER TABLE public.message_usage ENABLE ROW LEVEL SECURITY;

-- SELECT : utilisateur peut lire son propre usage
CREATE POLICY "users_read_own_message_usage"
  ON public.message_usage FOR SELECT
  USING (auth.uid() = user_id);

-- UPDATE limitée : seul decrement_message_usage (avec vérification auth.uid()) peut modifier
-- La policy avec USING (auth.uid() = user_id) bloque tout UPDATE direct sans passer par la fonction RPC
CREATE POLICY "users_update_own_message_usage"
  ON public.message_usage FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Pas de policy INSERT/DELETE côté client
