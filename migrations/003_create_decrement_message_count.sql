-- Migration 003 : RPC atomique pour décrémenter le compteur de messages
-- Appelée par le frontend AVANT chaque envoi de message
-- Atomique : vérification + incrément en une seule requête pour éviter race conditions
-- Retourne remaining >= 0 si succès, -1 si quota atteint

CREATE OR REPLACE FUNCTION public.decrement_message_count(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_remaining integer;
  v_subscription_status text;
BEGIN
  -- Sécurité : un utilisateur ne peut décrémenter que SON propre compteur
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Mise à jour atomique : on vérifie ET on incrémente en une seule opération
  -- Si messages_used >= messages_limit, 0 ligne est affectée
  -- Note: RETURNING capture les valeurs APRÈS la mise à jour (messages_used déjà incrémenté),
  -- donc on utilise une sous-requête pour capturer la valeur originale avant l'incrément.
  UPDATE public.user_subscriptions
  SET messages_used = messages_used + 1,
      updated_at = now()
  WHERE id = (SELECT id FROM public.user_subscriptions WHERE user_id = p_user_id LIMIT 1)
    AND messages_used < messages_limit
    AND subscription_status IN ('active', 'trialing')
  RETURNING (
    (SELECT messages_limit FROM public.user_subscriptions WHERE user_id = p_user_id)
    - messages_used
  ) INTO v_remaining;
  
  -- Si aucune ligne n'a été mise à jour (quota atteint ou abonnement inactif)
  IF v_remaining IS NULL THEN
    -- Vérifier le statut actuel pour le diagnostic
    SELECT subscription_status INTO v_subscription_status
    FROM public.user_subscriptions
    WHERE user_id = p_user_id;
    
    -- Retourner -1 pour indiquer échec
    RETURN jsonb_build_object(
      'success', false,
      'remaining', -1,
      'subscription_status', v_subscription_status
    );
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'remaining', v_remaining
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.decrement_message_count(uuid) TO authenticated;
