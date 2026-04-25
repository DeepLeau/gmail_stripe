-- Activation RLS sur user_subscriptions
-- Le service_role (webhooks, API routes serveur) bypass automatiquement cette protection
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
