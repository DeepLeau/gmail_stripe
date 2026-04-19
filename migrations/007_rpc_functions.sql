-- Fonctions RPC pour le decrement du compteur et la sync de limite
-- decrement_message_usage : appelé par le client (auth.uid() vérifié)
-- reset_monthly_message_usage : appelé par le cron serveur (service_role only)
-- sync_message_limit_from_plan : appelé par le webhook Stripe (service_role only)

-- ============================================================
-- Fonction : decrement_message_usage
-- Usage : appelé par le client à chaque message envoyé
-- Sécurité : vérification auth.uid() = p_user_id (empêche d'altérer un autre user)
-- ============================================================
CREATE OR REPLACE FUNCTION public.decrement_message_usage(
  p_user_id uuid,
  p_count   integer DEFAULT 1
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_used   integer;
  v_limit  integer;
BEGIN
  -- Sécurité : vérifier que l'appelant est authentifié
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Sécurité : vérifier que l'appelant ne peut décrémenter que son propre compteur
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Forbidden: can only decrement own message usage';
  END IF;

  -- Vérifier le quota disponible
  SELECT messages_used, messages_limit INTO v_used, v_limit
  FROM public.message_usage
  WHERE user_id = p_user_id;

  IF v_used + p_count > v_limit THEN
    RETURN false;  -- Quota épuisé
  END IF;

  -- Décrémenter
  UPDATE public.message_usage
  SET messages_used = messages_used + p_count,
      updated_at    = now()
  WHERE user_id = p_user_id;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.decrement_message_usage(uuid, integer) TO authenticated;

-- ============================================================
-- Fonction : reset_monthly_message_usage
-- Usage : appelé par le cron pg_cron pour réinitialiser les quotas mensuels
-- Sécurité : service_role only (pas de vérification auth.uid())
-- ============================================================
CREATE OR REPLACE FUNCTION public.reset_monthly_message_usage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.message_usage
  SET messages_used = 0,
      reset_at      = date_trunc('month', now() AT TIME ZONE 'UTC') + INTERVAL '1 month',
      updated_at    = now()
  WHERE reset_at <= now();
END;
$$;

GRANT EXECUTE ON FUNCTION public.reset_monthly_message_usage() TO service_role;

-- ============================================================
-- Fonction : sync_message_limit_from_plan
-- Usage : appelé par le webhook Stripe pour syncroniser la limite selon le plan souscrit
-- Sécurité : service_role only (pas de vérification auth.uid())
-- ============================================================
CREATE OR REPLACE FUNCTION public.sync_message_limit_from_plan(
  p_user_id uuid
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_plan_id   text;
  v_new_limit integer;
BEGIN
  -- Récupérer le plan actif
  SELECT plan_id INTO v_plan_id
  FROM public.user_subscriptions
  WHERE user_id = p_user_id
    AND subscription_status IN ('active', 'trialing');

  IF v_plan_id IS NULL THEN
    RAISE EXCEPTION 'No active subscription found for user';
  END IF;

  -- Calculer la limite selon le plan
  CASE v_plan_id
    WHEN 'start' THEN v_new_limit := 10;
    WHEN 'scale' THEN v_new_limit := 50;
    WHEN 'team'  THEN v_new_limit := 100;
    ELSE             v_new_limit := 10;
  END CASE;

  -- Mettre à jour la limite et la date de reset
  UPDATE public.message_usage
  SET messages_limit = v_new_limit,
      reset_at      = date_trunc('month', now() AT TIME ZONE 'UTC') + INTERVAL '1 month',
      updated_at    = now()
  WHERE user_id = p_user_id;

  RETURN v_new_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.sync_message_limit_from_plan(uuid) TO service_role;
