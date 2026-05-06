import { MOCK_RESPONSES, MOCK_RESPONSES_COUNT } from './responses'
import { decrementUnits } from '@/app/actions/subscription'
import { createClient } from '@/lib/supabase/client'

/**
 * Simulated network delay range in milliseconds.
 * Isolated as constants for easy tuning and testing.
 */
const MIN_DELAY_MS = 500
const MAX_DELAY_MS = 1000

/**
 * Generates a random delay between MIN_DELAY_MS and MAX_DELAY_MS.
 * Extracted for testability — can be mocked with a deterministic value in tests.
 */
export function simulateDelay(): Promise<void> {
  const delay = Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS + 1)) + MIN_DELAY_MS
  return new Promise((resolve) => setTimeout(resolve, delay))
}

/**
 * Selects a random response from the pool.
 * Extracted for testability — can be mocked with a specific index for deterministic tests.
 */
export function selectRandomResponse(): string {
  const index = Math.floor(Math.random() * MOCK_RESPONSES_COUNT)
  return MOCK_RESPONSES[index]
}

export interface SendMessageResult {
  text: string
  limitReached?: boolean
}

/**
 * Mock implementation of the chat API.
 * DISABLED in production — throws to force use of /api/chat/send.
 *
 * @param _content - The user's message content (ignored)
 * @throws Error indicating that the mock API is disabled in production
 */
export async function sendMessage(_content: string): Promise<string> {
  throw new Error('Mock API désactivée en production — utiliser /api/chat/send')
}

/**
 * Result type for sendChatMessage API call.
 */
export interface ChatResponse {
  text: string
  units_used?: number
  model?: string
  limitReached?: boolean
}

/**
 * API-compatible chat message sender.
 * Checks quota via decrementUnits() before calling /api/chat/send.
 * Allows unauthenticated users through without quota check.
 *
 * @param content - The user's message content
 * @param _userId - User ID (kept for API compatibility, not used in mock)
 * @returns Promise resolving to ChatResponse with AI text, units_used, or limitReached flag
 */
export async function sendChatMessage(
  content: string,
  _userId?: string
): Promise<ChatResponse> {
  const supabase = createClient()
  if (supabase) {
    const { data: sessionData } = await supabase.auth.getSession()
    if (sessionData?.session?.user) {
      const decrementResult = await decrementUnits()
      if (!decrementResult.success) {
        return { text: '', limitReached: true }
      }
    }
  }

  const response = await fetch('/api/chat/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  })

  if (!response.ok) {
    if (response.status === 403) {
      const error = await response.json()
      if (error.error === 'limit_reached') {
        return { text: '', limitReached: true }
      }
    }
    throw new Error('Failed to send message')
  }

  return response.json()
}
