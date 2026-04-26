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
 * API response shape from the billing-integrated sendMessage.
 * Includes quota information alongside the AI reply.
 */
export interface SendMessageResponse {
  reply: string
  messagesUsed: number
  messagesLimit: number
  isOverLimit: boolean
}
