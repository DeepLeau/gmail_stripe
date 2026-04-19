-- Grants pour service_role (webhooks Stripe, cron serveur)
-- service_role bypass RLS par conception Supabase — les grants assurent les droits DB nécessaires

-- Table user_subscriptions : INSERT/UPDATE/DELETE pour le webhook Stripe
GRANT INSERT, UPDATE, DELETE ON public.user_subscriptions TO service_role;
GRANT SELECT ON public.user_subscriptions TO service_role;

-- Table message_usage : UPDATE pour la réinitialisation mensuelle
GRANT UPDATE ON public.message_usage TO service_role;
GRANT SELECT ON public.message_usage TO service_role;

-- Grant sur la fonction trigger (pas nécessaire pour le trigger mais explicite)
GRANT EXECUTE ON FUNCTION public.init_message_usage_on_signup() TO service_role;

-- Fonctions service-to-service (créées en 007) — grants après création
