/**
 * Shared types for the chat feature.
 * Used by ChatInterface, ChatMessage, and mockApi.
 */
export interface ChatMessage {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: number
}

/**
 * Future API response shape (target after replacing mock).
 */
export interface SendMessageResponse {
  text: string
  model?: string
}

/**
 * Subscription information returned by GET /api/subscription.
 */
export interface SubscriptionInfo {
  plan: string
  quotaUsed: number
  quotaLimit: number
  quotaRenewedAt: string
  status: string
}

/**
 * Response from POST /api/messages/decrement.
 */
export interface DecrementResponse {
  remaining: number
}
