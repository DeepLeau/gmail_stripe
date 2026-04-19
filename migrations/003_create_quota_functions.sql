-- ============================================
-- Migration 003: Fonctions atomiques de gestion des quotas
-- Résolution race condition via SELECT FOR UPDATE
-- ============================================

-- Fonction atomique : incrémente messages_used avec verrouillage ligne
-- Appeler dans une transaction avec INSERT INTO messages après vérification succès
-- Retourne { success: boolean, messages_remaining: integer }
CREATE OR REPLACE FUNCTION public.increment_messages_used(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_row public.user_billing%ROWTYPE;
  v_new_count integer;
  v_limit integer;
  v_remaining integer;
BEGIN
  -- Verrouille la ligne pour éviter race condition
  SELECT * INTO v_row
  FROM public.user_billing
  WHERE user_id = p_user_id
  FOR UPDATE;
  
  -- Vérifie existence user_billing
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'billing_record_not_found');
  END IF;
  
  -- Réinitialise le quota si nouveau mois
  IF date_trunc('month', v_row.quota_reset_at) < date_trunc('month', now()) THEN
    UPDATE public.user_billing
    SET messages_used = 0, quota_reset_at = date_trunc('month', now()), updated_at = now()
    WHERE user_id = p_user_id;
    v_limit := v_row.messages_limit;
    v_new_count := 0;
  ELSE
    v_limit := v_row.messages_limit;
    v_new_count := v_row.messages_used;
  END IF;
  
  -- Vérifie si quota disponible
  IF v_new_count >= v_limit THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'quota_exceeded',
      'messages_remaining', 0,
      'messages_limit', v_limit
    );
  END IF;
  
  -- Incrémente atomiquement
  UPDATE public.user_billing
  SET messages_used = messages_used + 1, updated_at = now()
  WHERE user_id = p_user_id
  RETURNING messages_used INTO v_new_count;
  
  v_remaining := v_limit - v_new_count;
  
  RETURN jsonb_build_object(
    'success', true,
    'messages_used', v_new_count,
    'messages_remaining', GREATEST(0, v_remaining),
    'messages_limit', v_limit
  );
END;
$$;

-- Révoque exécution publique, accorde aux rôles authentifiés
REVOKE ALL ON FUNCTION public.increment_messages_used(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_messages_used(uuid) TO authenticated;

-- Fonction : vérifie et reset quota si changement de mois
-- Exécuter au début des requêtes billing pour cohérence
CREATE OR REPLACE FUNCTION public.check_and_reset_quota_if_needed(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.user_billing
  SET 
    messages_used = 0,
    quota_reset_at = date_trunc('month', now()),
    updated_at = now()
  WHERE 
    user_id = p_user_id
    AND date_trunc('month', quota_reset_at) < date_trunc('month', now());
  
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.check_and_reset_quota_if_needed(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_and_reset_quota_if_needed(uuid) TO authenticated;
