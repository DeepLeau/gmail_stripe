/**
 * Shared types for the subscription system.
 */
export type PlanSlug = 'start' | 'scale' | 'team'

export type SubscriptionStatus =
  | 'inactive'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'trialing'
  | 'unpaid'

export interface PlanDefinition {
  slug: PlanSlug
  label: string
  messagesPerMonth: number
  priceId: string
}

export interface SubscriptionInfo {
  plan: PlanSlug
  messagesLimit: number
  messagesRemaining: number
  status: SubscriptionStatus
  periodEnd: string // ISO date string
}

export interface DecrementResult {
  allowed: boolean
  remaining: number
  limit?: number
  plan?: PlanSlug
}

export interface SubscriptionRow {
  id: string
  user_id: string | null
  stripe_customer_id: string
  stripe_subscription_id: string | null
  stripe_session_id: string | null
  plan: PlanSlug
  messages_limit: number
  messages_used: number
  subscription_status: SubscriptionStatus
  current_period_start: string | null
  current_period_end: string | null
  created_at: string
  updated_at: string
}
