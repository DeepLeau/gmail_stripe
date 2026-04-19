-- Function atomique pour décrémenter le quota de messages
-- Évite les race conditions sur les appels concurrents
-- Usage côté serveur uniquement (pas exposé au client directement)
CREATE OR REPLACE FUNCTION public.update_quota_if_allowed(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_quota_remaining integer;
BEGIN
  -- Vérifie que l'utilisateur existe et a le droit d'envoyer un message
  -- FOR UPDATE verrouille la ligne pour éviter les conditions de concurrence
  SELECT (messages_limit - messages_used) INTO v_quota_remaining
  FROM public.user_billing
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- Si aucune ligne n'existe pour cet user, refuser
  IF v_quota_remaining IS NULL THEN
    RAISE EXCEPTION 'No billing record found for user';
  END IF;

  -- Si quota épuisé, retourner -1 pour signaler au client d'afficher le message upgrade
  IF v_quota_remaining <= 0 THEN
    RETURN -1;
  END IF;

  -- Décrémenter atomiquement et retourner le nouveau quota restant
  UPDATE public.user_billing
  SET 
    messages_used = messages_used + 1,
    updated_at = now()
  WHERE user_id = p_user_id;

  RETURN v_quota_remaining - 1;
END;
$$;

-- Révocation de l'accès public (seul le rôle authenticated peut exécuter)
REVOKE ALL ON FUNCTION public.update_quota_if_allowed(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_quota_if_allowed(uuid) TO authenticated;
