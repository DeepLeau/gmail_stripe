-- =====================================================
-- MIGRATION 10: Function apply_subscription_change
-- Upsert convergent pour le webhook Stripe.
-- Link par stripe_session_id OU stripe_customer_id.
-- Reset messages_used sur renewal (is_renewal = true).
-- SECURITY DEFINER → bypass RLS, réservé au service_role.
-- =====================================================
CREATE OR REPLACE FUNCTION public.apply_subscription_change(
    p_stripe_session_id TEXT,
    p_stripe_customer_id TEXT,
    p_stripe_subscription_id TEXT,
    p_plan TEXT,
    p_messages_limit INTEGER,
    p_subscription_status TEXT,
    p_current_period_start TIMESTAMPTZ,
    p_current_period_end TIMESTAMPTZ,
    p_is_renewal BOOLEAN DEFAULT FALSE
)
RETURNS public.user_subscriptions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_subscription public.user_subscriptions;
    v_existing_id UUID;
    v_existing_user_id UUID;
    v_existing_messages_used INTEGER;
    v_is_new BOOLEAN := FALSE;
BEGIN
    -- Cherche une subscription existante par stripe_session_id ou stripe_customer_id
    SELECT us.id, us.user_id, us.messages_used
    INTO v_existing_id, v_existing_user_id, v_existing_messages_used
    FROM public.user_subscriptions us
    WHERE (p_stripe_session_id IS NOT NULL AND us.stripe_session_id = p_stripe_session_id)
       OR (p_stripe_customer_id IS NOT NULL AND us.stripe_customer_id = p_stripe_customer_id)
    FOR UPDATE;

    -- Détermine si c'est une nouvelle row
    IF v_existing_id IS NULL THEN
        v_is_new := TRUE;
    END IF;

    -- Si renewal: reset messages_used à 0
    IF p_is_renewal THEN
        INSERT INTO public.user_subscriptions (
            user_id, stripe_session_id, stripe_customer_id, stripe_subscription_id,
            plan, messages_limit, messages_used, subscription_status,
            current_period_start, current_period_end
        )
        VALUES (
            COALESCE(v_existing_user_id, NULL),
            p_stripe_session_id,
            p_stripe_customer_id,
            p_stripe_subscription_id,
            p_plan,
            p_messages_limit,
            0,
            p_subscription_status,
            p_current_period_start,
            p_current_period_end
        )
        ON CONFLICT (stripe_session_id) DO UPDATE SET
            plan = EXCLUDED.plan,
            messages_limit = EXCLUDED.messages_limit,
            messages_used = 0,
            subscription_status = EXCLUDED.subscription_status,
            current_period_start = EXCLUDED.current_period_start,
            current_period_end = EXCLUDED.current_period_end,
            updated_at = NOW()
        RETURNING * INTO v_subscription;
    ELSE
        -- Upsert normal: préserve user_id existant si déjà lié
        INSERT INTO public.user_subscriptions (
            user_id, stripe_session_id, stripe_customer_id, stripe_subscription_id,
            plan, messages_limit, messages_used, subscription_status,
            current_period_start, current_period_end
        )
        VALUES (
            COALESCE(v_existing_user_id, NULL),
            p_stripe_session_id,
            p_stripe_customer_id,
            p_stripe_subscription_id,
            p_plan,
            p_messages_limit,
            COALESCE(v_existing_messages_used, 0),
            p_subscription_status,
            p_current_period_start,
            p_current_period_end
        )
        ON CONFLICT (stripe_session_id) DO UPDATE SET
            -- Préserve user_id si déjà lié, sinon remplit
            user_id = COALESCE(public.user_subscriptions.user_id, EXCLUDED.user_id),
            -- Préserve stripe_customer_id si déjà lié, sinon remplit
            stripe_customer_id = COALESCE(EXCLUDED.stripe_customer_id, public.user_subscriptions.stripe_customer_id),
            -- Met à jour stripe_subscription_id si fourni
            stripe_subscription_id = COALESCE(EXCLUDED.stripe_subscription_id, public.user_subscriptions.stripe_subscription_id),
            plan = EXCLUDED.plan,
            messages_limit = EXCLUDED.messages_limit,
            subscription_status = EXCLUDED.subscription_status,
            current_period_start = EXCLUDED.current_period_start,
            current_period_end = EXCLUDED.current_period_end,
            updated_at = NOW()
        RETURNING * INTO v_subscription;
    END IF;

    RETURN v_subscription;
END;
$$;

COMMENT ON FUNCTION public.apply_subscription_change IS
    'Convergent upsert for Stripe webhook. Links by stripe_session_id OR stripe_customer_id.
     Resets messages_used on renewal. SECURITY DEFINER bypasses RLS for webhook handling.
     Reserved for service_role only — never call from client-side code.';
