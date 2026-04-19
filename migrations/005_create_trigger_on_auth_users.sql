-- Trigger sur auth.users pour initialiser message_usage à l'inscription
-- Créé en dernier (après les tables et avant les grants/functions RPC)

CREATE OR REPLACE FUNCTION public.init_message_usage_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.message_usage (user_id, messages_used, messages_limit)
  VALUES (NEW.id, 0, 10);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_init_message_usage_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.init_message_usage_on_signup();

-- Pas de GRANT EXECUTE public — le trigger s'exécute automatiquement via PostgreSQL trigger engine
-- L'accès direct à la fonction par les clients est ainsi bloqué
