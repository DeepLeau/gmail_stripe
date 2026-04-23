-- Migration 005 : RPC pour lier une Stripe Checkout Session à un utilisateur
-- Appelée par la Server Action linkStripeSessionToUser après le signup
-- Upsert sur session_id OU stripe_customer_id pour convergence du linking

CREATE OR REPLACE FUNCTION public.link_stripe_session(
  p_user_id uuid,
  p_session_id text,
  p_stripe_customer_id text DEFAULT NULL
)
RETURNS public.user_subscriptions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_result public.user_subscriptions;
BEGIN
  -- Chercher une subscription existante par session_id ou stripe_customer_id
  -- et lier au user_id
  UPDATE public.user_subscriptions
  SET user_id = p_user_id,
      stripe_customer_id = COALESCE(p_stripe_customer_id, stripe_customer_id),
      updated_at = now()
  WHERE session_id = p_session_id
    AND (user_id IS NULL OR user_id = p_user_id)
  RETURNING * INTO v_result;
  
  -- Si aucune ligne trouvée via session_id, chercher par stripe_customer_id
  IF v_result IS NULL AND p_stripe_customer_id IS NOT NULL THEN
    UPDATE public.user_subscriptions
    SET user_id = p_user_id,
        session_id = COALESCE(p_session_id, session_id),
        updated_at = now()
    WHERE stripe_customer_id = p_stripe_customer_id
      AND (user_id IS NULL OR user_id = p_user_id)
    RETURNING * INTO v_result;
  END IF;
  
  -- Si toujours aucune ligne, créer une nouvelle entrée (cas rare : webhook pas encore arrivé)
  IF v_result IS NULL THEN
    INSERT INTO public.user_subscriptions (
      user_id,
      session_id,
      stripe_customer_id,
      plan,
      messages_limit,
      messages_used,
      subscription_status,
      created_at,
      updated_at
    )
    VALUES (
      p_user_id,
      p_session_id,
      p_stripe_customer_id,
      'start',
      10,
      0,
      'inactive',
      now(),
      now()
    )
    RETURNING * INTO v_result;
  END IF;
  
  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.link_stripe_session(uuid, text, text) TO service_role;
