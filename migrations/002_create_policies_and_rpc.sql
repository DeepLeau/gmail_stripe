-- ============================================================
-- Phase 5-6 : Policies RLS pour user_subscriptions
-- ============================================================

-- Lecture par l'utilisateur — consultation de son propre abonnement
CREATE POLICY "users_read_own_subscription"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Insert par le client UNIQUEMENT si la row n'existe pas encore (auto-subscription)
-- Note : le status initial est 'pending', le vrai plan/status est写入 par le webhook Stripe
-- Via service_role (bypass RLS). Cette policy empêche le client de s'auto-insérer
-- avec un plan différent de 'pending'.
CREATE POLICY "users_insert_own_subscription"
  ON public.user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id AND status = 'pending' AND plan = 'start');

-- Aucune policy UPDATE côté client — le client ne peut PAS modifier son plan/status/quotas
-- Les modifications passent par le webhook Stripe avec service_role (bypass RLS)
-- En l'absence de policy UPDATE, PostgreSQL interdit l'UPDATE côté client (comportement par défaut)

-- Aucune policy DELETE côté client — la suppression d'abonnement est gérée par le webhook
-- et le service_role (bypass RLS)

-- ============================================================
-- Phase 7-9 : Policies RLS pour user_messages
-- ============================================================

-- Lecture du quota pour affichage ChatInterface et QuotaBanner
CREATE POLICY "users_read_own_messages"
  ON public.user_messages FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================
-- FONCTION RPC : decrement_quota() — SEULE manière合法的 de décrémenter le quota
-- ============================================================
-- Problème résolu : une policy UPDATE standard permettrait à un client malveillant
-- d'injecter messages_used = 0 arbitrairement pour bypasser la limite.
-- Cette fonction encapsule la logique métier avec CHECK obligatoire.
--
-- Règles :
-- - SECURE DEFINER avec search_path explicite (évite injection par search_path)
-- - Vérifie auth.uid() (le caller doit être authentifié)
-- - CHECK : messages_used ne peut qu'augmenter de 1 (incrément atomique)
-- - Si quota épuisé, retourne false sans modification
--
-- Usage : appelé par la Server Action decrementQuota(), JAMAIS par UPDATE direct côté client

CREATE OR REPLACE FUNCTION public.decrement_quota()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  current_used integer;
  current_limit integer;
  new_used integer;
  v_user_id uuid;
  v_period_start timestamptz;
BEGIN
  -- Valider que le caller est authentifié
  v_user_id = auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Lecture atomique du quota actuel (FOR UPDATE lock la row)
  SELECT messages_used, messages_limit, period_start
  INTO current_used, current_limit, v_period_start
  FROM public.user_messages
  WHERE user_id = v_user_id
  FOR UPDATE;

  -- Si aucune row, initialiser avec les valeurs par défaut
  IF current_used IS NULL THEN
    INSERT INTO public.user_messages (user_id, messages_used, messages_limit, period_start)
    VALUES (v_user_id, 1, 10, date_trunc('month', now()))
    RETURNING true INTO new_used;
    RETURN true;
  END IF;

  -- CHECK métier : vérifier le renouvellement mensuel (reset si nouveau mois)
  IF date_trunc('month', now()) > date_trunc('month', v_period_start) THEN
    -- Nouveau mois : reset du compteur
    UPDATE public.user_messages
    SET messages_used = 1,
        period_start = date_trunc('month', now()),
        updated_at = now()
    WHERE user_id = v_user_id;
    RETURN true;
  END IF;

  -- CHECK métier : quota épuisé → refus
  IF current_used >= current_limit THEN
    RETURN false;
  END IF;

  -- Incrément atomique de 1
  new_used = current_used + 1;
  UPDATE public.user_messages
  SET messages_used = new_used,
      updated_at = now()
  WHERE user_id = v_user_id;

  RETURN true;
END;
$$;

-- Grant execute ONLY aux utilisateurs authentifiés (pas PUBLIC)
GRANT EXECUTE ON FUNCTION public.decrement_quota() TO authenticated;

-- ============================================================
-- FONCTION RPC : get_quota_status() — lecture du quota sans modifier
-- ============================================================
-- Retourne le nombre de messages restants pour l'utilisateur courant.
-- Utilisé par ChatInterface et QuotaBanner pour afficher le quota restant.

CREATE OR REPLACE FUNCTION public.get_quota_status()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id uuid;
  v_messages_used integer;
  v_messages_limit integer;
  v_period_start timestamptz;
BEGIN
  v_user_id = auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT messages_used, messages_limit, period_start
  INTO v_messages_used, v_messages_limit, v_period_start
  FROM public.user_messages
  WHERE user_id = v_user_id;

  -- Si aucune row, retourner le quota par défaut (plan free)
  IF v_messages_used IS NULL THEN
    RETURN jsonb_build_object(
      'messages_used', 0,
      'messages_limit', 10,
      'messages_remaining', 10,
      'period_start', date_trunc('month', now()),
      'is_exhausted', false
    );
  END IF;

  -- Vérifier le renouvellement mensuel
  IF date_trunc('month', now()) > date_trunc('month', v_period_start) THEN
    -- Nouveau mois : le quota est virtuellement réinitialisé
    RETURN jsonb_build_object(
      'messages_used', 0,
      'messages_limit', v_messages_limit,
      'messages_remaining', v_messages_limit,
      'period_start', date_trunc('month', now()),
      'is_exhausted', false
    );
  END IF;

  RETURN jsonb_build_object(
    'messages_used', v_messages_used,
    'messages_limit', v_messages_limit,
    'messages_remaining', greatest(0, v_messages_limit - v_messages_used),
    'period_start', v_period_start,
    'is_exhausted', v_messages_used >= v_messages_limit
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_quota_status() TO authenticated;
