-- Migration 004 : RPC pour lire le statut d'abonnement de l'utilisateur
-- Utilisée par le ChatHeader côté client pour afficher plan + messages restants
-- SECURITY DEFINER car appelée par authenticated users

CREATE OR REPLACE FUNCTION public.get_user_subscription(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_result jsonb;
BEGIN
  -- Sécurité : un utilisateur ne peut lire que son propre abonnement
  IF p_user_id != auth.uid() THEN
    RETURN NULL;
  END IF;
  
  SELECT jsonb_build_object(
    'plan', plan,
    'messages_limit', messages_limit,
    'messages_used', messages_used,
    'messages_remaining', messages_limit - messages_used,
    'current_period_start', current_period_start,
    'current_period_end', current_period_end,
    'subscription_status', subscription_status,
    'is_active', subscription_status IN ('active', 'trialing')
  )
  INTO v_result
  FROM public.user_subscriptions
  WHERE user_id = p_user_id;
  
  RETURN COALESCE(v_result, jsonb_build_object(
    'plan', 'start',
    'messages_limit', 10,
    'messages_used', 0,
    'messages_remaining', 10,
    'subscription_status', 'inactive',
    'is_active', false
  ));
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_subscription(uuid) TO authenticated;
