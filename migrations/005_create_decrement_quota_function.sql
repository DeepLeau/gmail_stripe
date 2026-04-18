-- ============================================
-- Migration 005: Fonction RPC décrémentation quota
-- Transaction atomique avec garde race condition
-- SECURITY DEFINER + search_path anti-hijacking
-- ============================================
CREATE OR REPLACE FUNCTION public.decrement_message_quota()
RETURNS TABLE(messages_count INTEGER, messages_limit INTEGER, is_limit_reached BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_count INTEGER;
  v_current_limit INTEGER;
BEGIN
  -- Verrouillage ligne pour éviter race condition
  SELECT messages_count, messages_limit INTO v_current_count, v_current_limit
  FROM public.profiles
  WHERE id = auth.uid()
  FOR UPDATE;

  -- Vérification existence profil
  IF v_current_count IS NULL THEN
    RETURN QUERY SELECT 0, 0, TRUE;
    RETURN;
  END IF;

  -- Vérification nullité colonnes (défensif)
  IF v_current_limit IS NULL THEN
    RETURN QUERY SELECT 0, 0, TRUE;
    RETURN;
  END IF;

  -- Vérification limite atteinte
  IF v_current_count >= v_current_limit THEN
    RETURN QUERY SELECT v_current_count, v_current_limit, TRUE;
    RETURN;
  END IF;

  -- Décrémentation atomique
  UPDATE public.profiles
  SET messages_count = messages_count + 1
  WHERE id = auth.uid();

  -- Récupération nouvelles valeurs
  SELECT messages_count, messages_limit INTO v_current_count, v_current_limit
  FROM public.profiles
  WHERE id = auth.uid();

  -- Vérification profil toujours existant après UPDATE
  IF v_current_count IS NULL THEN
    RAISE EXCEPTION 'Profile was deleted during quota decrement';
  END IF;

  RETURN QUERY SELECT v_current_count, v_current_limit, FALSE;
END;
$$;

-- Grant execute aux utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION public.decrement_message_quota() TO authenticated;
