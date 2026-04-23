-- apply_subscription_change: insert-or-update subscription + call reset_messages_on_renewal on renewal
CREATE OR REPLACE FUNCTION apply_subscription_change(
  p_stripe_customer_id TEXT,
  p_stripe_subscription_id TEXT,
  p_stripe_session_id TEXT,
  p_plan TEXT,
  p_messages_limit INTEGER,
  p_status TEXT,
  p_period_start TIMESTAMPTZ,
  p_period_end TIMESTAMPTZ,
  p_user_id UUID DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Try to find existing subscription row
  IF EXISTS (
    SELECT 1 FROM user_subscriptions
    WHERE stripe_customer_id = p_stripe_customer_id
      AND stripe_subscription_id = p_stripe_subscription_id
  ) THEN
    -- Update existing row
    UPDATE user_subscriptions
    SET
      stripe_session_id    = p_stripe_session_id,
      plan                 = p_plan,
      messages_limit       = p_messages_limit,
      status               = p_status,
      period_start         = p_period_start,
      period_end           = p_period_end
    WHERE stripe_customer_id = p_stripe_customer_id
      AND stripe_subscription_id = p_stripe_subscription_id;
  ELSE
    -- Insert new row, attaching user_id if provided
    INSERT INTO user_subscriptions (
      stripe_customer_id, stripe_subscription_id, stripe_session_id,
      user_id, plan, messages_limit, status, period_start, period_end
    ) VALUES (
      p_stripe_customer_id, p_stripe_subscription_id, p_stripe_session_id,
      COALESCE(p_user_id, auth.uid()),
      p_plan, p_messages_limit, p_status, p_period_start, p_period_end
    );
    -- If row was orphaned (user_id was NULL), backfill it now
    IF p_user_id IS NOT NULL THEN
      UPDATE user_subscriptions
      SET user_id = p_user_id
      WHERE stripe_customer_id = p_stripe_customer_id
        AND user_id IS NULL;
    END IF;
  END IF;

  -- Reset messages counter on renewal
  PERFORM reset_messages_on_renewal(p_stripe_subscription_id, p_period_start);
END;
$$;

-- reset_messages_on_renewal: reset messages_used when a subscription renews
CREATE OR REPLACE FUNCTION reset_messages_on_renewal(
  p_stripe_subscription_id TEXT,
  p_new_period_start TIMESTAMPTZ
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_period_start TIMESTAMPTZ;
BEGIN
  SELECT period_start INTO v_current_period_start
  FROM user_subscriptions
  WHERE stripe_subscription_id = p_stripe_subscription_id
  FOR UPDATE;

  IF v_current_period_start IS NOT NULL AND v_current_period_start < p_new_period_start THEN
    UPDATE user_subscriptions
    SET messages_used = 0
    WHERE stripe_subscription_id = p_stripe_subscription_id;
  END IF;
END;
$$;

-- decrement_message_count: decrement messages_used for the authenticated user
CREATE OR REPLACE FUNCTION decrement_message_count(p_user_id UUID) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_remaining INTEGER;
BEGIN
  SELECT (messages_limit - messages_used)
  INTO v_remaining
  FROM user_subscriptions
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_remaining IS NULL THEN
    -- No subscription row — allow (Free plan or no billing yet)
    RETURN json_build_object('success', true, 'remaining', NULL::INTEGER);
  END IF;

  IF v_remaining <= 0 THEN
    RETURN json_build_object('success', false, 'remaining', 0);
  END IF;

  UPDATE user_subscriptions
  SET messages_used = messages_used + 1
  WHERE user_id = p_user_id;

  RETURN json_build_object('success', true, 'remaining', v_remaining - 1);
END;
$$;

-- link_stripe_session_to_user: attach a newly created user account to a Stripe checkout session
CREATE OR REPLACE FUNCTION link_stripe_session_to_user(
  p_stripe_session_id TEXT,
  p_user_id UUID
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE user_subscriptions
  SET user_id = p_user_id
  WHERE stripe_session_id = p_stripe_session_id
    AND user_id IS NULL;
END;
$$;

-- Grant service_role access to all subscription RPC functions
GRANT EXECUTE ON FUNCTION apply_subscription_change(
  TEXT, TEXT, TEXT, TEXT, INTEGER, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, UUID
) TO service_role;

GRANT EXECUTE ON FUNCTION reset_messages_on_renewal(TEXT, TIMESTAMPTZ) TO service_role;

GRANT EXECUTE ON FUNCTION decrement_message_count(UUID) TO service_role;

GRANT EXECUTE ON FUNCTION link_stripe_session_to_user(TEXT, UUID) TO service_role;
