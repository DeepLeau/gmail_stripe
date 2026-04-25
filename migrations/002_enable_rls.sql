-- ============================================================
-- MIGRATION 002: Enable Row Level Security on subscriptions
-- Table: public.subscriptions
-- Risque: Aucun — protège les données d'abonnement
-- ============================================================

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Supprimer les default policies generated par Supabase (trop permissives)
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON public.subscriptions;
DROP POLICY IF EXISTS "Enable insert access for users based on user_id" ON public.subscriptions;
DROP POLICY IF EXISTS "Enable update access for users based on user_id" ON public.subscriptions;
DROP POLICY IF EXISTS "Enable delete access for users based on user_id" ON public.subscriptions;
