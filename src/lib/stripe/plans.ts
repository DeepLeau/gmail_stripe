/**
 * Plan definitions for the Stripe subscription system.
 * All plan configuration lives here — single source of truth.
 */
import type { PlanSlug, PlanDefinition } from '@/types/subscriptions'

export const PLANS: Record<PlanSlug, PlanDefinition> = {
  start: {
    slug: 'start',
    label: 'Start',
    messagesPerMonth: 10,
    priceId: process.env.STRIPE_PRICE_START ?? '',
  },
  scale: {
    slug: 'scale',
    label: 'Scale',
    messagesPerMonth: 50,
    priceId: process.env.STRIPE_PRICE_SCALE ?? '',
  },
  team: {
    slug: 'team',
    label: 'Team',
    messagesPerMonth: 100,
    priceId: process.env.STRIPE_PRICE_TEAM ?? '',
  },
}

const VALID_SLUGS: PlanSlug[] = ['start', 'scale', 'team']

/**
 * Returns the plan definition for a given slug, or null if invalid.
 */
export function getPlanBySlug(slug: string): PlanDefinition | null {
  if (!VALID_SLUGS.includes(slug as PlanSlug)) {
    return null
  }
  return PLANS[slug as PlanSlug]
}

/**
 * Returns true if the given slug corresponds to a valid plan.
 */
export function isValidPlanSlug(slug: string): slug is PlanSlug {
  return VALID_SLUGS.includes(slug as PlanSlug)
}

/**
 * Returns the price ID for a plan slug.
 * Throws if the env var is not set (fail-fast at runtime).
 */
export function getPriceId(slug: PlanSlug): string {
  const plan = PLANS[slug]
  if (!plan.priceId) {
    throw new Error(
      `Missing Stripe price ID for plan "${slug}". ` +
        `Set the STRIPE_PRICE_${slug.toUpperCase()} environment variable.`
    )
  }
  return plan.priceId
}
