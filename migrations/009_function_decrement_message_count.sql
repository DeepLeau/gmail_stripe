-- =====================================================
-- MIGRATION 09: Function decrement_message_count
-- RPC atomique pour décrémenter messages_used.
-- Retourne {success, remaining}.
-- Free tier (pas de row) → {true, 999999}.
-- SECURITY DEFINER + SET search_path (anti hijacking).
-- =====================================================
CREATE OR REPLACE FUNCTION public.decrement_message_count(p_user_id UUID)
RETURNS TABLE(success BOOLEAN, remaining INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_messages_limit INTEGER;
    v_messages_used INTEGER;
    v_plan TEXT;
BEGIN
    -- Vérifie si l'utilisateur a un abonnement actif
    SELECT us.messages_limit, us.messages_used, us.plan
    INTO v_messages_limit, v_messages_used, v_plan
    FROM public.user_subscriptions us
    WHERE us.user_id = p_user_id
      AND us.subscription_status = 'active'
    FOR UPDATE;

    -- Pas d'abonnement actif (free tier) → succès avec limite haute
    IF v_messages_limit IS NULL THEN
        RETURN QUERY SELECT TRUE AS success, 999999 AS remaining;
        RETURN;
    END IF;

    -- Incrémentation atomique
    UPDATE public.user_subscriptions
    SET messages_used = messages_used + 1,
        updated_at = NOW()
    WHERE user_id = p_user_id
      AND subscription_status = 'active';

    -- Retourne le résultat
    RETURN QUERY SELECT
        (v_messages_used + 1 <= v_messages_limit) AS success,
        (v_messages_limit - v_messages_used - 1) AS remaining;
END;
$$;

COMMENT ON FUNCTION public.decrement_message_count IS
    'Atomic message count decrement. Returns {success, remaining}.
     Free tier returns {true, 999999}. SECURITY DEFINER with SET search_path.
     NOTE: Client should validate auth.uid() = p_user_id before calling.';
