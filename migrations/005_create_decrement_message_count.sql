-- RPC atomique pour décrémenter le compteur de messages
-- SECURITY INVOKER (défaut) : s'exécute avec les droits du caller
-- Vérifie auth.uid() pour s'assurer que l'appelant est authentifié
CREATE OR REPLACE FUNCTION public.decrement_message_count(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_remaining integer;
  v_current_limit integer;
BEGIN
  -- Vérification authentification
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Authentication required', 'remaining', 0);
  END IF;

  -- Vérification que l'user qui appelle est bien le propriétaire
  IF auth.uid() != p_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Forbidden', 'remaining', 0);
  END IF;

  -- Verrouillage FOR UPDATE pour atomicité
  SELECT messages_limit
  INTO v_current_limit
  FROM public.user_subscriptions
  WHERE user_id = p_user_id
  AND subscription_status IN ('active', 'trialing')
  FOR UPDATE;

  -- Si pas d'abonnement actif → refuser (pas de plan gratuit implicite avec crédits)
  IF v_current_limit IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No active subscription', 'remaining', 0);
  END IF;

  -- UPDATE atomique avec vérification dans la clause WHERE pour éviter race condition
  -- Si la condition n'est pas satisfaite (déjà à limite), l'UPDATE retourne 0 ligne
  UPDATE public.user_subscriptions
  SET messages_used = messages_used + 1
  WHERE user_id = p_user_id
  AND messages_limit - messages_used >= 1
  RETURNING messages_limit - messages_used INTO v_remaining;

  -- Si aucune ligne mise à jour → limite atteinte
  IF v_remaining IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Message limit reached', 'remaining', 0);
  END IF;

  RETURN jsonb_build_object('success', true, 'remaining', v_remaining);

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM, 'remaining', 0);
END;
$$;

-- Grant EXECUTE aux utilisateurs authentifiés uniquement
GRANT EXECUTE ON FUNCTION public.decrement_message_count(uuid) TO authenticated;
