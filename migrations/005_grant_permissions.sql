-- ============================================================
-- Migration 005: Grants pour les RPC functions
-- ============================================================

-- Les fonctions sont en SECURITY DEFINER (executées avec droits du owner)
-- On donne explicitement le droit d'execution aux roles concernés

-- Execute pour les utilisateurs authentifiés (Server Actions côté client)
GRANT EXECUTE ON FUNCTION public.decrement_message_count(uuid) 
  TO authenticated;

GRANT EXECUTE ON FUNCTION public.apply_subscription_change(
  text, text, text, text, integer, timestamptz, timestamptz, text
) TO authenticated;

GRANT EXECUTE ON FUNCTION public.link_stripe_session_to_user(text, uuid) 
  TO authenticated;

-- Execute pour le service_role (webhooks Stripe handlers)
GRANT EXECUTE ON FUNCTION public.apply_subscription_change(
  text, text, text, text, integer, timestamptz, timestamptz, text
) TO service_role;

GRANT EXECUTE ON FUNCTION public.link_stripe_session_to_user(text, uuid) 
  TO service_role;

-- Le service_role peut aussi lire les subscriptions (webhook verification)
GRANT SELECT ON TABLE public.user_subscriptions TO service_role;

-- Revoke execution pour le role PUBLIC (pas d'acces anon)
REVOKE EXECUTE ON FUNCTION public.decrement_message_count(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.apply_subscription_change(
  text, text, text, text, integer, timestamptz, timestamptz, text
) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.link_stripe_session_to_user(text, uuid) FROM PUBLIC;

COMMENT ON GRANT EXECUTE ON FUNCTION public.decrement_message_count IS 
  'Cette fonction est appelée côté client (Server Component header chat)
   pour afficher les messages restants. Elle est aussi appelée par
   les Server Actions avant chaque envoi de message.';

COMMENT ON GRANT EXECUTE ON FUNCTION public.apply_subscription_change IS 
  'Handler webhook Stripe - doit être executable par service_role uniquement.
   Les Server Actions client n''appellent pas directement cette fonction.';

COMMENT ON GRANT EXECUTE ON FUNCTION public.link_stripe_session_to_user IS 
  'Server Action appelée après signup pour lier la session Stripe
   à l''utilisateur nouvellement créé. Appelé côté client (Next.js Server Action).';
