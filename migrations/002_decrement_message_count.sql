-- =============================================================================
-- MIGRATION 002: Fonction RPC atomique pour décrémenter le compteur de messages
-- Utilisée avant chaque envoi de message pour vérifier/gérer le quota
-- =============================================================================

CREATE OR REPLACE FUNCTION public.decrement_message_count()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id uuid;
  v_remaining integer;
  v_messages_limit integer;
  v_messages_used integer;
  v_plan text;
BEGIN
  -- Récupérer et valider l'user_id depuis le contexte d'authentification
  v_user_id = auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Sélect for UPDATE : verrouiller la ligne pour éviter les races conditions
  SELECT messages_limit, messages_used, plan
  INTO v_messages_limit, v_messages_used, v_plan
  FROM public.user_subscriptions
  WHERE user_id = v_user_id
  FOR UPDATE;

  -- Si pas d'abonnement, refuser
  IF v_messages_limit IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'no_subscription',
      'message', 'Aucun abonnement trouvé. Veuillez vous abonner pour utiliser le service.'
    );
  END IF;

  -- Calculer les messages restants
  v_remaining = v_messages_limit - v_messages_used;

  -- Si limite atteinte, refuser
  IF v_remaining <= 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'limit_reached',
      'remaining', 0,
      'limit', v_messages_limit,
      'message', 'Limite atteinte — upgrade vers un plan supérieur pour continuer.'
    );
  END IF;

  -- Décrémenter atomiquement via UPDATE (la CHECK constraint messages_used >= 0 protège contre les valeurs négatives)
  UPDATE public.user_subscriptions
  SET messages_used = messages_used + 1
  WHERE user_id = v_user_id;

  -- Retourner le succès avec les infos actualisées
  RETURN jsonb_build_object(
    'success', true,
    'remaining', v_remaining - 1,  -- remaining après decrement
    'limit', v_messages_limit,
    'plan', v_plan
  );

EXCEPTION
  WHEN check_violation THEN
    -- La CHECK constraint messages_used >= 0 a bloqué : ne devrait pas arriver
    -- car on a vérifié remaining > 0 avant le decrement
    RETURN jsonb_build_object(
      'success', false,
      'error', 'limit_exceeded',
      'message', 'Limite de messages atteinte.'
    );
END;
$$;

-- GrantEXECUTE uniquement aux utilisateurs authentifiés (pas PUBLIC)
GRANT EXECUTE ON FUNCTION public.decrement_message_count() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.decrement_message_count() FROM PUBLIC;
