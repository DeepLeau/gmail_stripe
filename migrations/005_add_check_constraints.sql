-- Contrainte CHECK sur le plan — valeurs autorisées uniquement
-- Protection contre injection de valeurs non prévues
ALTER TABLE public.user_billing
  ADD CONSTRAINT check_plan_values
  CHECK (plan IN ('free', 'start', 'scale', 'team'))
  NOT VALID;

-- Contrainte CHECK sur le statut d'abonnement
ALTER TABLE public.user_billing
  ADD CONSTRAINT check_subscription_status_values
  CHECK (subscription_status IN ('active', 'inactive', 'past_due', 'canceled', 'trialing', 'unpaid'))
  NOT VALID;

-- Validation des contraintes sur les données existantes
ALTER TABLE public.user_billing
  VALIDATE CONSTRAINT check_plan_values;

ALTER TABLE public.user_billing
  VALIDATE CONSTRAINT check_subscription_status_values;

-- Contrainte métier : messages_used ne peut pas dépasser messages_limit
ALTER TABLE public.user_billing
  ADD CONSTRAINT check_messages_used_not_exceeds_limit
  CHECK (messages_used <= messages_limit);

-- Contrainte : messages_used et messages_limit >= 0
ALTER TABLE public.user_billing
  ADD CONSTRAINT check_messages_non_negative
  CHECK (messages_used >= 0 AND messages_limit >= 0);

-- Contrainte : current_period_end doit être après current_period_start si两者都 non null
ALTER TABLE public.user_billing
  ADD CONSTRAINT check_period_dates_valid
  CHECK (
    current_period_start IS NULL OR current_period_end IS NULL
    OR current_period_end > current_period_start
  );
