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
