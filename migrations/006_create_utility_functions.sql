-- ============================================
-- Migration 006: Fonctions utilitaires billing
-- Fonctions helper pour le frontend et API
-- ============================================

-- Fonction : retourne le statut quota actuel pour un user
-- Utilisée par /api/billing et interface utilisateur
CREATE OR REPLACE FUNCTION public.get_user_quota_status(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_result jsonb;
BEGIN
  -- Reset si nouveau mois
  PERFORM public.check_and_reset_quota_if_needed(p_user_id);
  
  SELECT jsonb_build_object(
    'plan', plan,
    'subscription_status', subscription_status,
    'messages_used', messages_used,
    'messages_limit', messages_limit,
    'messages_remaining', GREATEST(0, messages_limit - messages_used),
    'quota_reset_at', quota_reset_at,
    'trial_ends_at', trial_ends_at,
    'is_trial_active', trial_ends_at IS NOT NULL AND trial_ends_at > now()
  ) INTO v_result
  FROM public.user_billing
  WHERE user_id = p_user_id;
  
  RETURN COALESCE(v_result, jsonb_build_object(
    'error', 'billing_record_not_found',
    'plan', 'free',
    'subscription_status', 'inactive',
    'messages_used', 0,
    'messages_limit', 100,
    'messages_remaining', 100
  ));
END;
$$;

REVOKE ALL ON FUNCTION public.get_user_quota_status(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_quota_status(uuid) TO authenticated;

-- Fonction : initialise un enregistrement billing pour un user (appelée après signup)
-- Plan par défaut: free, 100 messages
CREATE OR REPLACE FUNCTION public.initialize_user_billing(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Vérifie que l'user existe
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
    RETURN false;
  END IF;
  
  -- Insère ou ne fait rien si déjà existant
  INSERT INTO public.user_billing (user_id, plan, messages_limit, quota_reset_at)
  VALUES (p_user_id, 'free', 100, date_trunc('month', now()))
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.initialize_user_billing(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.initialize_user_billing(uuid) TO authenticated;
