-- Table des abonnements utilisateurs
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_session_id TEXT,
  plan TEXT NOT NULL DEFAULT 'start' CHECK (plan IN ('start', 'scale', 'team')),
  subscription_status TEXT NOT NULL DEFAULT 'active',
  messages_limit INTEGER NOT NULL DEFAULT 10,
  messages_used INTEGER NOT NULL DEFAULT 0,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Lecture seule côté client (via Supabase-js)
CREATE POLICY "Users can read own subscription"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- RPC atomique : décrémente le compteur de messages
CREATE OR REPLACE FUNCTION public.decrement_message_count(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.user_subscriptions
  SET
    messages_used = LEAST(messages_used + 1, messages_limit),
    updated_at = now()
  WHERE user_id = p_user_id;
END;
$$;

-- RPC apply_subscription_change : upsert avec plan + quota
CREATE OR REPLACE FUNCTION public.apply_subscription_change(
  p_stripe_session_id TEXT,
  p_stripe_customer_id TEXT,
  p_stripe_subscription_id TEXT,
  p_plan TEXT,
  p_messages_limit INTEGER,
  p_current_period_start TIMESTAMPTZ,
  p_current_period_end TIMESTAMPTZ,
  p_status TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_subscriptions (
    user_id,
    stripe_customer_id,
    stripe_subscription_id,
    stripe_session_id,
    plan,
    subscription_status,
    messages_limit,
    messages_used,
    current_period_start,
    current_period_end
  )
  VALUES (
    auth.uid(),
    p_stripe_customer_id,
    p_stripe_subscription_id,
    p_stripe_session_id,
    p_plan,
    p_status,
    p_messages_limit,
    0,
    p_current_period_start,
    p_current_period_end
  )
  ON CONFLICT (user_id) DO UPDATE SET
    stripe_customer_id = COALESCE(p_stripe_customer_id, user_subscriptions.stripe_customer_id),
    stripe_subscription_id = COALESCE(p_stripe_subscription_id, user_subscriptions.stripe_subscription_id),
    stripe_session_id = COALESCE(p_stripe_session_id, user_subscriptions.stripe_session_id),
    plan = p_plan,
    subscription_status = p_status,
    messages_limit = p_messages_limit,
    messages_used = 0,
    current_period_start = COALESCE(p_current_period_start, user_subscriptions.current_period_start),
    current_period_end = COALESCE(p_current_period_end, user_subscriptions.current_period_end),
    updated_at = now();
END;
$$;
