-- Migration: user_subscriptions table for Stripe billing
-- Run this after your initial auth/users setup migration

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  plan text NOT NULL DEFAULT 'start' CHECK (plan IN ('start', 'scale', 'team')),
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_session_id text,
  subscription_status text NOT NULL DEFAULT 'pending'
    CHECK (subscription_status IN ('pending', 'active', 'canceled', 'past_due')),
  messages_limit integer NOT NULL DEFAULT 10,
  messages_used integer NOT NULL DEFAULT 0,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own subscription
CREATE POLICY "Users read their own subscription"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- No INSERT/UPDATE/DELETE for anon/authenticated clients — only service_role (webhook/API)
CREATE POLICY "No client inserts"
  ON public.user_subscriptions FOR INSERT
  WITH CHECK (false);

CREATE POLICY "No client updates"
  ON public.user_subscriptions FOR UPDATE
  USING (false);

CREATE POLICY "No client deletes"
  ON public.user_subscriptions FOR DELETE
  USING (false);

-- Atomic quota decrement function
CREATE OR REPLACE FUNCTION public.decrement_quota(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_used integer;
  current_limit integer;
  new_used integer;
  allowed boolean;
  remaining integer;
BEGIN
  -- Get current quota
  SELECT messages_used, messages_limit
  INTO current_used, current_limit
  FROM public.user_subscriptions
  WHERE user_id = target_user_id
  FOR UPDATE;

  -- If no subscription found, use free plan defaults
  IF current_used IS NULL THEN
    current_used := 0;
    current_limit := 10;
  END IF;

  IF current_used >= current_limit THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'messages_remaining', 0
    );
  END IF;

  -- Increment messages_used atomically
  UPDATE public.user_subscriptions
  SET messages_used = messages_used + 1,
      updated_at = now()
  WHERE user_id = target_user_id
  RETURNING messages_used INTO new_used;

  remaining := current_limit - new_used;

  RETURN jsonb_build_object(
    'allowed', true,
    'messages_remaining', remaining
  );
END;
$$;

-- Allow authenticated users to call the quota decrement function
GRANT EXECUTE ON FUNCTION public.decrement_quota TO authenticated;
