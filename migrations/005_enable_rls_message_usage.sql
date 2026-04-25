-- Activation RLS sur message_usage
-- Les API routes serveur (service_role) mettent à jour le compteur après chaque message
ALTER TABLE public.message_usage ENABLE ROW LEVEL SECURITY;
