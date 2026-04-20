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
 * Subscription information for authenticated users.
 * Loaded server-side and passed to ChatInterface and UserMenu.
 */
export interface SubscriptionInfo {
  plan: 'start' | 'scale' | 'team'
  planName: string
  status: 'pending' | 'active' | 'canceled'
  messagesUsed: number
  messagesLimit: number
}

/**
 * Response from the decrementQuota server action.
 */
export interface DecrementQuotaResponse {
  success: boolean
  messagesUsed: number
  messagesLimit: number
  reset: boolean
}

/**
 * Response when quota is exceeded.
 */
export interface QuotaExceededResponse {
  error: 'Quota exceeded'
  messagesUsed: number
  messagesLimit: number
}

/**
 * Send message states for ChatInterface.
 */
export type SendMessageState = 'idle' | 'sending' | 'quota_exceeded' | 'success' | 'error'
