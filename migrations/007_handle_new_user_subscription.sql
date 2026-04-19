-- Trigger function exécutée à la création d'un nouvel user dans auth.users
-- Insère automatiquement une row dans monthly_usage avec messages_limit=0 (plan gratuit)
-- SECURITY DEFINER : bypass RLS pour permettre l'insertion sans grant INSERT au client
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Insère une row monthly_usage avec quota 0 (plan gratuit)
  INSERT INTO public.monthly_usage (user_id, messages_sent, messages_limit, current_period_start, current_period_end)
  VALUES (NEW.id, 0, 0, date_trunc('month', now()), date_trunc('month', now()) + interval '1 month')
  ON CONFLICT (user_id) DO NOTHING;

  -- Retourne la row auth.users inchangée
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user_subscription() FROM PUBLIC;
-- Pas de GRANT car SECURITY DEFINER bypass RLS
-- Seul le trigger peut l'appeler

COMMENT ON FUNCTION public.handle_new_user_subscription IS 'Trigger function — crée une row monthly_usage (quota=0) à chaque nouvel user. SECURITY DEFINER pour bypass RLS.';
