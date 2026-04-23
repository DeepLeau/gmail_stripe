-- Migration 007 : Activation de la Row Level Security sur user_subscriptions
-- Prérequis obligatoire avant la création des policies

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
