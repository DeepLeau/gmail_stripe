/**
 * Plan definitions for Emind subscription tiers.
 * Single source of truth — edit here when prices or Stripe Price IDs change.
 */

export const SUBSCRIPTION_PLANS = {
  start: {
    id: 'start',
    name: 'Start',
    description: 'Pour découvrir Emind sans engagement.',
    priceMonthlyEur: 9,
    priceId: process.env.STRIPE_PRICE_START ?? '',
    messagesLimit: 100,
    // renewal_period is monthly (Stripe default)
  },
  scale: {
    id: 'scale',
    name: 'Scale',
    description: 'Pour les professionnels qui gèrent plusieurs boîtes email.',
    priceMonthlyEur: 29,
    priceId: process.env.STRIPE_PRICE_SCALE ?? '',
    messagesLimit: 500,
  },
  team: {
    id: 'team',
    name: 'Team',
    description: 'Pour les équipes qui veulent automatiser leurs réponses à grande échelle.',
    priceMonthlyEur: 79,
    priceId: process.env.STRIPE_PRICE_TEAM ?? '',
    messagesLimit: -1, // unlimited
  },
} as const

export type PlanId = keyof typeof SUBSCRIPTION_PLANS

export const PLAN_IDS = Object.keys(SUBSCRIPTION_PLANS) as PlanId[]

/**

* Returns the plan definition for a given planId.
* Returns null if planId is not recognised.
 */
export function getPlan(planId: string | null): (typeof SUBSCRIPTION_PLANS)[PlanId] | null {
  if (!planId) return null
  const key = planId as PlanId
  if (key in SUBSCRIPTION_PLANS) {
    return SUBSCRIPTION_PLANS[key]
  }
  return null
}

/**
 * Returns messages limit for a plan — -1 means unlimited.
 */
export function getMessagesLimit(planId: string | null): number {
  const plan = getPlan(planId)
  return plan ? plan.messagesLimit : 100
}

/**
 * Returns true when the quota is exhausted.
 * For unlimited plans (-1) always returns false.
 */
export function isQuotaExceeded(
  messagesUsed: number,
  messagesLimit: number
): boolean {
  if (messagesLimit === -1) return false
  return messagesUsed >= messagesLimit
}

/**
 * Returns the next renewal date (first day of next month, ISO string).
 * Used when creating or renewing a subscription.
 */
export function getNextRenewalDate(): string {
  const now = new Date()
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return next.toISOString()
}
