-- Activation de Row Level Security sur user_billing
-- Obligatoire avant toute policy — sans RLS, tout utilisateur peut tout lire/écrire
ALTER TABLE public.user_billing ENABLE ROW LEVEL SECURITY;
