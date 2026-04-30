/**
 * Stripe client configuration — server-side only.
 * Uses lazy initialization to avoid build-time errors when env vars are missing.
 * Never instantiate at module scope.
 */
import Stripe from 'stripe'

export type PlanSlug = 'starter' | 'growth' | 'pro'

interface PlanConfig {
  id: PlanSlug
  priceIdEnvKey: string
  messagesLimit: number
  displayName: string
  priceEur: number
}

const PLANS: Record<PlanSlug, PlanConfig> = {
  starter: {
    id: 'starter',
    priceIdEnvKey: 'STRIPE_STARTER_PRICE_ID',
    messagesLimit: 50,
    displayName: 'Starter',
    priceEur: 9,
  },
  growth: {
    id: 'growth',
    priceIdEnvKey: 'STRIPE_GROWTH_PRICE_ID',
    messagesLimit: 200,
    displayName: 'Growth',
    priceEur: 29,
  },
  pro: {
    id: 'pro',
    priceIdEnvKey: 'STRIPE_PRO_PRICE_ID',
    messagesLimit: 1000,
    displayName: 'Pro',
    priceEur: 79,
  },
}

let stripeInstance: Stripe | null = null

/**
 * Returns the Stripe client. Throws if STRIPE_SECRET_KEY is not set.
 * Memoized — safe to call multiple times per request without re-instantiating.
 */
export function getStripe(): Stripe {
  if (stripeInstance) return stripeInstance
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set')
  }
  stripeInstance = new Stripe(key)
  return stripeInstance
}

/**
 * Validates that a plan slug is one of the supported plans.
 */
export function isValidPlan(plan: string): plan is PlanSlug {
  return plan === 'starter' || plan === 'growth' || plan === 'pro'
}

/**
 * Alias for isValidPlan — validates that a plan slug is one of the supported plans.
 */
export const isValidPlanSlug = isValidPlan

/**
 * Returns the Stripe Price ID for a given plan.
 * Throws if the corresponding env var is not set.
 */
export function getPriceId(plan: PlanSlug): string {
  const config = PLANS[plan]
  const priceId = process.env[config.priceIdEnvKey]
  if (!priceId) {
    throw new Error(`${config.priceIdEnvKey} environment variable is not set for plan '${plan}'`)
  }
  return priceId
}

/**
 * Returns the message limit for a given plan.
 */
export function getPlanLimit(plan: PlanSlug): number {
  return PLANS[plan].messagesLimit
}

/**
 * Logs which Stripe env vars are missing at startup time.
 * Call this early in the route handler, not at module scope.
 */
export function logMissingStripeEnvVars(): void {
  const missing: string[] = []
  if (!process.env.STRIPE_SECRET_KEY) missing.push('STRIPE_SECRET_KEY')
  if (!process.env.STRIPE_WEBHOOK_SECRET) missing.push('STRIPE_WEBHOOK_SECRET')
  for (const plan of Object.values(PLANS)) {
    if (!process.env[plan.priceIdEnvKey]) {
      missing.push(plan.priceIdEnvKey)
    }
  }
  if (missing.length > 0) {
    console.warn(`[Stripe] Missing env vars: ${missing.join(', ')}`)
  }
}

/**
 * Base URL of the application, used for redirect URLs after checkout.
 */
export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ??
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
