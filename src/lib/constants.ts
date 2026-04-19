/**
 * Constantes partagées de l'application — plans, limites, etc.
 */
import { type StripePlanId } from './stripe/server'

export const APP_NAME = 'Emind'

export const FREE_MESSAGES_LIMIT = 10

export const PLAN_MESSAGES_LIMITS: Record<StripePlanId | 'free', number> = {
  free: 10,
  start: 10,
  scale: 50,
  team: 100,
}

export const PLAN_PRICES: Record<StripePlanId, number> = {
  start: 9,
  scale: 29,
  team: 79,
}

export type AppPlan = keyof typeof PLAN_MESSAGES_LIMITS

export function getMessagesLimitForPlan(plan: AppPlan): number {
  return PLAN_MESSAGES_LIMITS[plan] ?? FREE_MESSAGES_LIMIT
}
