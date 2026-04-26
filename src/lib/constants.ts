export const PLAN_LIMITS = {
  start: 10,
  scale: 50,
  team: 100,
} as const

export type PLAN_CODES = 'start' | 'scale' | 'team'

export const PRICE_ID_TO_PLAN: Record<string, string> = {
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_START ?? '']: 'start',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_SCALE ?? '']: 'scale',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_TEAM ?? '']: 'team',
}
