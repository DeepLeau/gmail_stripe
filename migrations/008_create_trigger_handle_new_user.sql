-- Trigger qui déclenche handle_new_user_subscription sur INSERT dans auth.users
-- Garantit que chaque nouvel user a immédiatement une entry monthly_usage
CREATE TRIGGER trg_auto_create_monthly_usage
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_subscription();

COMMENT ON TRIGGER trg_auto_create_monthly_usage ON auth.users IS 'Auto-crée une row monthly_usage (quota=0) pour chaque nouvel user';
