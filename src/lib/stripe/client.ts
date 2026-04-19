/**
 * Stripe types shared with client components.
 * Server-only helpers are in src/lib/stripe/server.ts.
 */

export type PlanId = 'free' | 'start' | 'scale' | 'team'

export interface PlanConfig {
  id: PlanId
  name: string
  messagesPerMonth: number
  priceEur: number
}

export interface UserSubscriptionInfo {
  plan: PlanId
  messagesLimit: number
  messagesUsed: number
  messagesRemaining: number
  subscriptionStatus: string
}

export interface DecrementResponse {
  allowed: boolean
  remaining: number
  plan?: PlanId
}
