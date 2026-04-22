-- Migration 003: Fonctions RPC pour writes protégés
-- SECURITY DEFINER + SET search_path = public, pg_temp (anti-injection)
-- Les appels client ne passent uniquement via ces fonctions, jamais en direct

-- Fonction atomique de décrémentation du compteur de messages
-- Appelée par le client avant chaque envoi de message
-- Retourne le nombre de messages restants (0 si quota épuisé)
CREATE OR REPLACE FUNCTION public.decrement_message_count(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_remaining integer;
BEGIN
  -- Validation: caller doit être authentifié et correspondre à la cible
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: cannot decrement another user''s message count';
  END IF;

  -- Tentative d'increment atomique: ne fait rien si quota déjà épuisé
  UPDATE public.user_subscriptions
  SET
    messages_used = messages_used + 1,
    updated_at = now()
  WHERE
    user_id = p_user_id
    AND messages_used < messages_limit
  RETURNING
    messages_limit - messages_used
  INTO v_remaining;

  -- Si aucune ligne mise à jour (quota épuisé), retourner 0
  IF v_remaining IS NULL THEN
    RETURN 0;
  END IF;

  RETURN v_remaining;
END;
$$;

-- Révoquer l'accès public, accorder aux utilisateurs authentifiés uniquement
REVOKE ALL ON FUNCTION public.decrement_message_count(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.decrement_message_count(uuid) TO authenticated;

-- Fonction d'upsert appelée par le webhook Stripe
-- Signature: apply_subscription_change(
--   p_stripe_session_id text,
--   p_stripe_customer_id text,
--   p_stripe_subscription_id text,
--   p_user_id uuid,
--   p_plan text,
--   p_messages_limit integer,
--   p_current_period_end timestamptz
-- )
-- Gère les deux cas: webhook avant signup (sans user_id) et après signup (avec user_id)
-- Met à jour stripe_subscription_id si disponible
CREATE OR REPLACE FUNCTION public.apply_subscription_change(
  p_stripe_session_id text,
  p_stripe_customer_id text,
  p_stripe_subscription_id text,
  p_user_id uuid,
  p_plan text,
  p_messages_limit integer,
  p_current_period_end timestamptz
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Validation des paramètres obligatoires
  IF p_stripe_session_id IS NULL AND p_stripe_customer_id IS NULL THEN
    RAISE EXCEPTION 'At least one Stripe identifier (session or customer) is required';
  END IF;

  IF p_plan IS NULL OR p_messages_limit IS NULL OR p_current_period_end IS NULL THEN
    RAISE EXCEPTION 'Plan, messages_limit and current_period_end are required';
  END IF;

  -- Upsert: chercher par session_id OU customer_id selon disponibilité
  -- Scénario 1: webhook arrive avec session_id (premier checkout)
  -- Scénario 2: renewal webhook arrive avec customer_id mais sans session_id
  -- Scénario 3: linking post-signup met à jour un enregistrement orphelin

  UPDATE public.user_subscriptions
  SET
    plan = p_plan,
    messages_limit = p_messages_limit,
    current_period_end = p_current_period_end,
    updated_at = now()
  WHERE
    stripe_session_id = p_stripe_session_id
    OR (p_stripe_session_id IS NULL AND stripe_customer_id = p_stripe_customer_id)
  RETURNING id;

  -- Si UPDATE a affecté une ligne, on sort (upsert terminé)
  IF FOUND THEN
    -- Mise à jour de stripe_subscription_id si disponible (renewal)
    IF p_stripe_subscription_id IS NOT NULL THEN
      UPDATE public.user_subscriptions
      SET stripe_subscription_id = p_stripe_subscription_id
      WHERE stripe_session_id = p_stripe_session_id
        OR (p_stripe_session_id IS NULL AND stripe_customer_id = p_stripe_customer_id);
    END IF;
    RETURN;
  END IF;

  -- Aucune ligne existante: INSERT si user_id est disponible
  -- Si user_id est NULL (webhook avant signup), on crée un enregistrement
  -- "orphelin" qui sera mis à jour lors du linking ultérieur
  IF p_user_id IS NOT NULL THEN
    INSERT INTO public.user_subscriptions (
      user_id,
      plan,
      messages_limit,
      messages_used,
      stripe_session_id,
      stripe_customer_id,
      stripe_subscription_id,
      current_period_end
    ) VALUES (
      p_user_id,
      p_plan,
      p_messages_limit,
      0,
      p_stripe_session_id,
      p_stripe_customer_id,
      p_stripe_subscription_id,
      p_current_period_end
    );
  END IF;
END;
$$;

-- Accès service_role uniquement (webhooks backend)
REVOKE ALL ON FUNCTION public.apply_subscription_change(text, text, text, uuid, text, integer, timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.apply_subscription_change(text, text, text, uuid, text, integer, timestamptz) TO service_role;

