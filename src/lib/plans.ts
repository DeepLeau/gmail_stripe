export type PlanSlug = 'starter' | 'growth' | 'pro'

export interface Plan {
  slug: PlanSlug
  label: string
  price_cents: number
  messages_limit: number
  unitSingular: string
  unitPlural: string
  priceId: string
}

export const PLANS: Plan[] = [
  {
    slug: 'starter',
    label: 'Starter',
    price_cents: 900, // 9 €
    messages_limit: 50,
    unitSingular: 'message',
    unitPlural: 'messages',
    priceId: process.env.STRIPE_PRICE_STARTER ?? '',
  },
  {
    slug: 'growth',
    label: 'Growth',
    price_cents: 2900, // 29 €
    messages_limit: 200,
    unitSingular: 'message',
    unitPlural: 'messages',
    priceId: process.env.STRIPE_PRICE_GROWTH ?? '',
  },
  {
    slug: 'pro',
    label: 'Pro',
    price_cents: 7900, // 79 €
    messages_limit: 1000,
    unitSingular: 'message',
    unitPlural: 'messages',
    priceId: process.env.STRIPE_PRICE_PRO ?? '',
  },
]

export function validatePlanSlug(slug: string): slug is PlanSlug {
  return (PLANS.find((p) => p.slug === slug) !== undefined)
}

export function getPlanBySlug(slug: string): Plan | undefined {
  return PLANS.find((p) => p.slug === slug)
}
