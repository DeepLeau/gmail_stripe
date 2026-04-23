-- Migration 002 : RPC pour upsert d'abonnement, appelée par le webhook Stripe
-- SECURITY DEFINER pour bypasser RLS — seul le serveur (webhook) peut appeler
-- Idempotent via ON CONFLICT sur stripe_subscription_id

CREATE OR REPLACE FUNCTION public.apply_subscription_change(
  p_user_id uuid,
  p_plan text,
  p_stripe_customer_id text,
  p_stripe_subscription_id text,
  p_session_id text DEFAULT NULL,
  p_messages_limit integer,
  p_current_period_start timestamptz,
  p_current_period_end timestamptz,
  p_subscription_status text DEFAULT 'active'
)
RETURNS public.user_subscriptions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_result public.user_subscriptions;
  v_plan_map jsonb;
  v_existing_user_id uuid;
BEGIN
  -- Validation des entrées
  IF p_plan NOT IN ('start', 'scale', 'team') THEN
    RAISE EXCEPTION 'Invalid plan: %', p_plan;
  END IF;
  
  IF p_subscription_status NOT IN ('active', 'trialing', 'past_due', 'canceled', 'unpaid', 'inactive') THEN
    RAISE EXCEPTION 'Invalid subscription_status: %', p_subscription_status;
  END IF;
  
  -- Sécurité critique : refuser d'insérer si user_id est NULL.
  -- Cela peut arriver si le webhook Stripe arrive avant le signup/link Stripe session.
  -- Dans ce cas, la subscription reste non-liée en base. Le webhook doit être rejoué
  -- APRÈS que link_stripe_session ait lié le stripe_customer_id au user_id.
  -- On refuse l'INSERT pour éviter de créer des lignes user_id=NULL qui :
  --   1. Seront invisibles pour l'utilisateur via RLS (auth.uid() = NULL → pas TRUE)
  --   2. Feront que get_user_subscription retourne le plan par défaut 'start'
  --      alors qu'un abonnement actif existe réellement.
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'Cannot create subscription with NULL user_id. Replay webhook after Stripe session linking.';
  END IF;
  
  -- Sécurité : si stripe_customer_id est déjà lié à un autre user, refuser
  -- (empêche de rattacher un abonnement Stripe existant à un compte arbitraire)
  IF p_stripe_customer_id IS NOT NULL THEN
    SELECT user_id INTO v_existing_user_id
    FROM public.user_subscriptions
    WHERE stripe_customer_id = p_stripe_customer_id
      AND user_id IS NOT NULL
    LIMIT 1;
    
    IF v_existing_user_id IS NOT NULL AND v_existing_user_id != p_user_id THEN
      RAISE EXCEPTION 'stripe_customer_id already linked to another user';
    END IF;
  END IF;
  
  -- Mapping plan -> messages_limit si non fourni
  v_plan_map := '{"start": 10, "scale": 50, "team": 100}'::jsonb;
  
  IF p_messages_limit IS NULL THEN
    p_messages_limit := (v_plan_map->>p_plan)::integer;
  END IF;
  
  -- Upsert sur stripe_subscription_id (unique) — idempotent
  INSERT INTO public.user_subscriptions (
    user_id,
    stripe_customer_id,
    stripe_subscription_id,
    session_id,
    plan,
    messages_limit,
    messages_used,
    current_period_start,
    current_period_end,
    subscription_status,
    created_at,
    updated_at
  )
  VALUES (
    p_user_id,
    p_stripe_customer_id,
    p_stripe_subscription_id,
    p_session_id,
    p_plan,
    p_messages_limit,
    0,  -- reset messages_used sur changement de période
    p_current_period_start,
    p_current_period_end,
    p_subscription_status,
    now(),
    now()
  )
  ON CONFLICT (stripe_subscription_id) DO UPDATE SET
    user_id = COALESCE(EXCLUDED.user_id, public.user_subscriptions.user_id),
    stripe_customer_id = COALESCE(EXCLUDED.stripe_customer_id, public.user_subscriptions.stripe_customer_id),
    session_id = COALESCE(EXCLUDED.session_id, public.user_subscriptions.session_id),
    plan = EXCLUDED.plan,
    messages_limit = EXCLUDED.messages_limit,
    messages_used = 0,  -- reset sur renew
    current_period_start = EXCLUDED.current_period_start,
    current_period_end = EXCLUDED.current_period_end,
    subscription_status = EXCLUDED.subscription_status,
    updated_at = now()
  RETURNING * INTO v_result;
  
  RETURN v_result;
END;
$$;

-- Accorder l'exécution au rôle service_role uniquement (ou authenticated si utilisé via API)
-- Le webhook Stripe appelle cette fonction côté serveur avec service_role
GRANT EXECUTE ON FUNCTION public.apply_subscription_change(
  uuid, text, text, text, text, integer, timestamptz, timestamptz, text
) TO service_role;
