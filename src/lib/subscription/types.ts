/**
 * Types shared between backend and frontend for the subscription system.
 * Centralized here so that frontend can import them directly from this file.
 */

// Plan identifiers
export type PlanId = 'start' | 'scale' | 'team'

// Quota state returned by GET /api/profile/messages
export interface QuotaState {
  plan: string
  messagesUsed: number
  messagesLimit: number
  renewalDate: string
  isLimitReached: boolean
}

// Checkout verification response
export interface CheckoutVerifyResponse {
  status: 'ok' | 'error'
  plan?: string
  error?: string
}
