-- Incrémente le compteur de messages pour un utilisateur
-- Atomique : utilise WITH (locks) pour éviter les race conditions
-- Résette automatiquement la période si un nouveau mois a commencé
-- SECURITY INVOKER : vérifie que l'user ne peut incrémenter que son propre compteur
CREATE OR REPLACE FUNCTION public.increment_message_count(p_user_id uuid, p_count integer DEFAULT 1)
RETURNS SETOF public.monthly_usage
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_current_period_start timestamptz;
  v_should_reset boolean;
BEGIN
  -- Vérification auth
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Vérification user_id match (empêche un user d'incrémenter le compteur d'un autre)
  IF auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Access denied: you can only increment your own counter';
  END IF;

  -- Validation p_count
  IF p_count < 1 THEN
    RAISE EXCEPTION 'p_count must be >= 1';
  END IF;

  -- Lecture de la période actuelle (avec LOCK pour atomicité)
  SELECT current_period_start INTO v_current_period_start
  FROM public.monthly_usage
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- Vérifie si la période est expirée ou nulle
  v_should_reset := v_current_period_start IS NULL
    OR v_current_period_start < date_trunc('month', now());

  -- Upsert atomique
  IF v_should_reset THEN
    -- Nouvelle période (ou row nulle) : réinitialise le compteur
    INSERT INTO public.monthly_usage (user_id, messages_sent, messages_limit, current_period_start, current_period_end)
    VALUES (p_user_id, p_count, 0, date_trunc('month', now()), date_trunc('month', now()) + interval '1 month')
    ON CONFLICT (user_id) DO UPDATE
      SET messages_sent = EXCLUDED.messages_sent,
          current_period_start = EXCLUDED.current_period_start,
          current_period_end = EXCLUDED.current_period_end,
          updated_at = now();
  ELSE
    -- Période en cours : incrémente le compteur
    INSERT INTO public.monthly_usage (user_id, messages_sent, messages_limit, current_period_start, current_period_end)
    VALUES (p_user_id, p_count, 0, v_current_period_start, v_current_period_start + interval '1 month')
    ON CONFLICT (user_id) DO UPDATE
      SET messages_sent = public.monthly_usage.messages_sent + EXCLUDED.messages_sent,
          updated_at = now();
  END IF;

  -- Retourne la row mise à jour
  RETURN QUERY SELECT * FROM public.monthly_usage WHERE user_id = p_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_message_count(uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_message_count(uuid, integer) TO authenticated;

COMMENT ON FUNCTION public.increment_message_count IS 'Incrémente le compteur de messages pour le user connecté. Atomique via LOCK, reset de période automatique.';
