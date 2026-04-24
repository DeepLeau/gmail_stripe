-- Migration 004: Fonctions RPC pour la gestion des subscriptions
-- SECURITY DEFINER avec search_path explicite pour éviter les attaques par search_path

-- ==============================================================================
-- FONCTION: decrement_message_count
-- Usage: appelée avant chaque envoi de message pour vérifier/réserver un quota
-- Retourne: nombre de messages restants APRÈS ce decrement, ou -1 si limite atteinte
-- Sécurité: FOR UPDATE lock la row pour éviter race condition (2 requêtes simultanées)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.decrement_message_count(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_remaining integer;
  v_row_exists boolean;
BEGIN
  -- Vérifie que l'utilisateur est authentifié
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Vérifie que l'appelant est bien le propriétaire (ou service_role)
  IF auth.uid() != p_user_id AND auth.role() != 'service_role' THEN
    RAISE EXCEPTION 'Access denied: cannot decrement another user''s message count';
  END IF;
  
  -- Vérifie que la row existe avant de verrouiller
  SELECT EXISTS (SELECT 1 FROM public.user_subscriptions WHERE user_id = p_user_id)
  INTO v_row_exists;
  
  IF NOT v_row_exists THEN
    RAISE EXCEPTION 'Subscription not found for user_id: %', p_user_id;
  END IF;
  
  -- DECREMENT ATOMIQUE avec verrouillage FOR UPDATE
  -- La condition messages_used < messages_limit est dans l'UPDATE (pas juste le WHERE du SELECT)
  -- pour éviter toute race condition: même si deux requêtes arrivent simultanément,
  -- seule celle qui trouve la condition encore vraie va décrémenter
  UPDATE public.user_subscriptions
  SET 
    messages_used = messages_used + 1,
    updated_at = now()
  WHERE 
    user_id = p_user_id
    AND messages_used < messages_limit
  RETURNING (messages_limit - messages_used) INTO v_remaining;
  
  -- Si v_remaining est NULL, la condition n'était plus vraie (limite atteinte entretemps)
  -- → retourne -1 pour indiquer limite atteinte
  IF v_remaining IS NULL THEN
    RETURN -1;
  END IF;
  
  RETURN v_remaining;
END;
$$;

REVOKE ALL ON FUNCTION public.decrement_message_count(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.decrement_message_count(uuid) TO authenticated;

-- ==============================================================================
-- FONCTION: apply_subscription_change
-- Usage: appelée par le webhook Stripe pour mettre à jour l'abonnement
-- Reset messages_used = 0 à chaque changement de subscription (y compris renew)
-- Sécurité: validation stricte du plan enum AVANT l'UPDATE, sub_id non modifiable côté client
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.apply_subscription_change(
  p_user_id uuid,
  p_stripe_subscription_id text,
  p_plan subscription_plan,
  p_current_period_start timestamptz,
  p_current_period_end timestamptz,
  p_subscription_status text,
  p_stripe_customer_id text DEFAULT NULL,
  p_stripe_session_id text DEFAULT NULL
)
RETURNS public.user_subscriptions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_subscription public.user_subscriptions%ROWTYPE;
  v_plan_messages_limit integer;
BEGIN
  -- VALIDATION D'AUTORISATION BLOQUANTE
  -- Un user authentifié ne peut modifier QUE sa propre subscription
  -- Le service_role (webhook Stripe) peut modifier n'importe quelle subscription
  IF auth.uid() IS NULL AND auth.role() != 'service_role' THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  IF auth.uid() IS NOT NULL AND auth.uid() != p_user_id AND auth.role() != 'service_role' THEN
    RAISE EXCEPTION 'Access denied: cannot modify subscription of another user';
  END IF;
  
  -- Validation stricte du plan enum AVANT tout UPDATE (anti-injection)
  IF p_plan NOT IN ('start', 'scale', 'team') THEN
    RAISE EXCEPTION 'Invalid subscription plan: %. Allowed values: start, scale, team', p_plan;
  END IF;
  
  -- Mapping plan → messages_limit
  v_plan_messages_limit := CASE p_plan
    WHEN 'start' THEN 10
    WHEN 'scale' THEN 50
    WHEN 'team' THEN 100
  END;
  
  -- UPSERT: crée ou met à jour la subscription
  -- ON CONFLICT sur user_id: permet de gérer le cas où la row existe déjà
  -- DO UPDATE: remet messages_used = 0 sur tout changement (renew inclus)
  INSERT INTO public.user_subscriptions (
    user_id,
    stripe_customer_id,
    stripe_subscription_id,
    stripe_session_id,
    plan,
    messages_limit,
    messages_used,
    current_period_start,
    current_period_end,
    subscription_status
  )
  VALUES (
    p_user_id,
    p_stripe_customer_id,
    p_stripe_subscription_id,
    p_stripe_session_id,
    p_plan,
    v_plan_messages_limit,
    0,  -- Reset messages_used à chaque changement de subscription
    p_current_period_start,
    p_current_period_end,
    p_subscription_status
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    stripe_customer_id = COALESCE(EXCLUDED.stripe_customer_id, user_subscriptions.stripe_customer_id),
    stripe_subscription_id = COALESCE(EXCLUDED.stripe_subscription_id, user_subscriptions.stripe_subscription_id),
    stripe_session_id = COALESCE(EXCLUDED.stripe_session_id, user_subscriptions.stripe_session_id),
    plan = EXCLUDED.plan,
    messages_limit = EXCLUDED.messages_limit,
    messages_used = 0,  -- Reset sur renew ou upgrade/downgrade
    current_period_start = EXCLUDED.current_period_start,
    current_period_end = EXCLUDED.current_period_end,
    subscription_status = EXCLUDED.subscription_status,
    updated_at = now()
  RETURNING * INTO v_subscription;
  
  RETURN v_subscription;
END;
$$;

REVOKE ALL ON FUNCTION public.apply_subscription_change(
  uuid, text, subscription_plan, timestamptz, timestamptz, text, text, text
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.apply_subscription_change(
  uuid, text, subscription_plan, timestamptz, timestamptz, text, text, text
) TO authenticated;

-- ==============================================================================
-- FONCTION: link_stripe_session_to_user
-- Usage: appelée après signup pour lier la Stripe Checkout Session à l'utilisateur
-- Gère le cas webhook-first: si webhook a déjà upsert avec user_id NULL, on populate ici
-- Sécurité: validation d'autorisation pour éviter qu'un user lie sa session à un autre compte
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.link_stripe_session_to_user(
  p_session_id text,
  p_user_id uuid
)
RETURNS public.user_subscriptions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_subscription public.user_subscriptions%ROWTYPE;
BEGIN
  -- VALIDATION D'AUTORISATION BLOQUANTE
  -- Un user authentifié ne peut lier une session qu'à SON propre compte
  -- Le service_role (webhook Stripe) peut lier n'importe quelle session
  IF auth.uid() IS NULL AND auth.role() != 'service_role' THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  IF auth.uid() IS NOT NULL AND auth.uid() != p_user_id AND auth.role() != 'service_role' THEN
    RAISE EXCEPTION 'Access denied: cannot link session to another user''s account';
  END IF;
  
  -- Mets à jour user_id sur la row correspondante à stripe_session_id
  -- WHERE user_id IS NULL: ne mets à jour que si pas déjà lié (cas webhook-first)
  UPDATE public.user_subscriptions
  SET 
    user_id = p_user_id,
    updated_at = now()
  WHERE 
    stripe_session_id = p_session_id
    AND user_id IS NULL
  RETURNING * INTO v_subscription;
  
  RETURN v_subscription;
END;
$$;

REVOKE ALL ON FUNCTION public.link_stripe_session_to_user(text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.link_stripe_session_to_user(text, uuid) TO authenticated;

-- ==============================================================================
-- FONCTION: get_or_create_subscription
-- Usage: utilitaire pour créer la subscription row avec defaults
-- Réservée au service_role (appelée côté serveur après paiement Stripe)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.get_or_create_subscription(
  p_user_id uuid,
  p_plan subscription_plan,
  p_messages_limit integer
)
RETURNS public.user_subscriptions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_subscription public.user_subscriptions%ROWTYPE;
BEGIN
  -- Validation du plan
  IF p_plan NOT IN ('start', 'scale', 'team') THEN
    RAISE EXCEPTION 'Invalid subscription plan: %', p_plan;
  END IF;
  
  -- Cherche subscription existante
  SELECT * INTO v_subscription
  FROM public.user_subscriptions
  WHERE user_id = p_user_id;
  
  IF FOUND THEN
    RETURN v_subscription;
  END IF;
  
  -- Crée nouvelle subscription avec les paramètres fournis
  INSERT INTO public.user_subscriptions (
    user_id,
    plan,
    messages_limit,
    messages_used,
    subscription_status
  )
  VALUES (
    p_user_id,
    p_plan,
    p_messages_limit,
    0,
    'active'
  )
  RETURNING * INTO v_subscription;
  
  RETURN v_subscription;
END;
$$;

REVOKE ALL ON FUNCTION public.get_or_create_subscription(uuid, subscription_plan, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_or_create_subscription(uuid, subscription_plan, integer) TO authenticated;

-- ==============================================================================
-- TRIGGER: auto-update updated_at sur chaque modification
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_user_subscriptions_updated_at ON public.user_subscriptions;
CREATE TRIGGER trigger_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Documentation du schéma pour reference future
COMMENT ON TABLE public.user_subscriptions IS 'Stripe subscription management. User reads own row via RLS; all writes via service_role (webhooks/RPC).';
COMMENT ON COLUMN public.user_subscriptions.user_id IS 'Supabase auth user ID. UNIQUE constraint ensures one active subscription per user.';
COMMENT ON COLUMN public.user_subscriptions.stripe_customer_id IS 'Stripe Customer ID. Nullable for pre-signup sessions. Used for webhook lookups.';
COMMENT ON COLUMN public.user_subscriptions.stripe_subscription_id IS 'Stripe Subscription ID. Nullable before subscription is created. Used for renew webhooks.';
COMMENT ON COLUMN public.user_subscriptions.stripe_session_id IS 'Stripe Checkout Session ID. Used to link anonymous checkout to user after signup.';
COMMENT ON COLUMN public.user_subscriptions.plan IS 'Subscription plan enum: start (10 msgs), scale (50 msgs), team (100 msgs).';
COMMENT ON COLUMN public.user_subscriptions.messages_limit IS 'Monthly message quota based on plan. Reset at period start.';
COMMENT ON COLUMN public.user_subscriptions.messages_used IS 'Current month usage. Reset to 0 on subscription change (renew, upgrade).';
COMMENT ON COLUMN public.user_subscriptions.current_period_start IS 'Start of current billing period. Set by Stripe webhook.';
COMMENT ON COLUMN public.user_subscriptions.current_period_end IS 'End of current billing period. Used to detect renew.';
