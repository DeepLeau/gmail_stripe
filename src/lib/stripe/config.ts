import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

export function getStripe(): Stripe {
  if (stripeInstance) return stripeInstance
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }
  stripeInstance = new Stripe(key)
  return stripeInstance
}

export type StripePlanName = 'free' | 'starter' | 'growth' | 'pro' | 'enterprise'

/**
 * SubscriptionData reflects the shape returned by the /api/subscription GET endpoint,
 * and maps to the user_subscriptions DB table columns.
 */
export interface SubscriptionData {
  plan: StripePlanName | 'free'
  status: string
  units_used: number
  units_limit: number
  units_remaining: number | null
  current_period_end: string | null
}

export const PLAN_PRICE_IDS: Record<StripePlanName, string> = {
  free: process.env.STRIPE_PRICE_ID_FREE || 'price_free_default',
  starter: process.env.STRIPE_PRICE_STARTER || 'price_starter_default',
  growth: process.env.STRIPE_PRICE_GROWTH || 'price_growth_default',
  pro: process.env.STRIPE_PRICE_PRO || 'price_pro_default',
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise_default'
}

export const PLAN_LIMITS: Record<StripePlanName, { messages: number; apiCalls: number }> = {
  free: { messages: 100, apiCalls: 1000 },
  starter: { messages: 5000, apiCalls: 50000 },
  growth: { messages: 50000, apiCalls: 500000 },
  pro: { messages: 50000, apiCalls: 500000 },
  enterprise: { messages: Infinity, apiCalls: Infinity }
}

export function getPriceId(plan: StripePlanName): string {
  return PLAN_PRICE_IDS[plan]
}

export function getPlanByPriceId(priceId: string): StripePlanName | null {
  const entry = Object.entries(PLAN_PRICE_IDS).find(([, id]) => id === priceId)
  if (!entry) return null
  return entry[0] as StripePlanName
}

export function getPlanLimit(plan: StripePlanName): number {
  return PLAN_LIMITS[plan].messages
}

export function isValidPlan(plan: string): plan is StripePlanName {
  return (['free', 'starter', 'growth', 'pro', 'enterprise'] as string[]).includes(plan)
}
