/**
 * src/lib/plans.ts
 *
 * Canonical plan definitions — source of truth for all plan-related data.
 * Used by src/lib/data.ts (landing page) and any other consumer needing plan info.
 *
 * Matches the structure expected by src/lib/data.ts's `getPlanBySlug`.
 */
export type PlanSlug = 'start' | 'scale' | 'team'

export interface PlanRecord {
  id: PlanSlug
  display_name: string
  monthly_price_cents: number
  description: string
  messages_limit: number
}

export const PLANS: Record<PlanSlug, PlanRecord> = {
  start: {
    id: 'start',
    display_name: 'Start',
    monthly_price_cents: 1000,
    description: 'Pour découvrir Emind et ses réponses intelligentes.',
    messages_limit: 10,
  },
  scale: {
    id: 'scale',
    display_name: 'Scale',
    monthly_price_cents: 3900,
    description: 'Pour les professionnels qui gèrent plus de volumes.',
    messages_limit: 50,
  },
  team: {
    id: 'team',
    display_name: 'Team',
    monthly_price_cents: 7900,
    description: 'Pour les équipes qui ont besoin de plus.',
    messages_limit: 100,
  },
}

/**
 * Returns all plans as an array.
 * Matches the shape expected by data.ts getPlanBySlug consumer.
 */
export function getAllPlans(): PlanRecord[] {
  return Object.values(PLANS)
}

/**
 * Returns the display name for a plan slug.
 */
export function getPlanDisplayName(slug: PlanSlug): string {
  return PLANS[slug]?.display_name ?? slug
}
