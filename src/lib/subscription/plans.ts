/**
 * src/lib/subscription/plans.ts
 *
 * Configuration centralisée des 3 plans Stripe.
 * Source unique — utilisé par Pricing.tsx et les routes API.
 */
export interface PlanEntry {
  slug: 'starter' | 'growth' | 'pro'
  display_name: string
  description: string
  price: string
  messages_limit: number
  badge: string
  highlighted: boolean
}

export const PLANS_ARRAY: PlanEntry[] = [
  {
    slug: 'starter',
    display_name: 'Starter',
    description: 'Pour découvrir Emind et automatiser tes réponses email.',
    price: '9',
    messages_limit: 50,
    badge: '',
    highlighted: false,
  },
  {
    slug: 'growth',
    display_name: 'Growth',
    description: 'Pour les professionnels qui vivent dans leurs emails.',
    price: '29',
    messages_limit: 200,
    badge: 'Recommandé',
    highlighted: true,
  },
  {
    slug: 'pro',
    display_name: 'Pro',
    description: 'Pour les power users qui gèrent plusieurs boîtes email.',
    price: '79',
    messages_limit: 1000,
    badge: '',
    highlighted: false,
  },
]

export const PLANS_MAP = new Map(PLANS_ARRAY.map((p) => [p.slug, p]))
