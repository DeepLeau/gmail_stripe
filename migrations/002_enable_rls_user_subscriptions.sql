-- Migration 002: Activation de RLS sur public.user_subscriptions
-- RLS obligatoire pour sécuriser l'accès aux données d'abonnement

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
