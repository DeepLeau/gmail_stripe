import { createClient } from '@/lib/supabase/client'
import { MOCK_RESPONSES, MOCK_RESPONSES_COUNT } from './responses'

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

/**
 * Mock implementation of the chat API.
 *
 * Current signature (mock):
 *   async function sendMessage(content: string): Promise<string>
 *
 * Target signature (future replacement with real API):
 *   async function sendMessage(content: string): Promise<{ text: string; model?: string }>
 *
 * @param _content - The user's message content (ignored in mock, kept for signature compatibility)
 * @returns The AI response as a plain string
 */
export async function sendMessage(_content: string): Promise<string> {
  await simulateDelay()
  return selectRandomResponse()
}

/**
 * Response type for sendChatMessage API call.
 */
export interface ChatResponse {
  text: string
  units_used?: number
  model?: string
}

/**
 * Result type for gated chat messages.
 */
export interface SendResult {
  limitReached?: boolean
  text?: string
  units_used?: number
  model?: string
}

/**
 * API-compatible chat message sender with quota gating.
 *
 * Calls the real /api/chat/send endpoint.
 * Before sending, calls the decrement_units RPC to enforce quota.
 * If the RPC reports limit_reached, returns { limitReached: true } without calling the API.
 * If no subscription is found (error code 'no_subscription'), allows the message through.
 *
 * @param content - The user's message content
 * @param _userId - User ID (kept for API compatibility, not used in mock)
 * @returns Promise resolving to SendResult
 */
export async function sendChatMessage(
  content: string,
  _userId?: string
): Promise<SendResult> {
  const supabase = createClient()

  // Try to decrement units via RPC — enforces quota gating
  if (supabase) {
    try {
      const { data: decrementData, error: decrementError } = await supabase.rpc('decrement_units')

      if (!decrementError && decrementData) {
        const result = decrementData as { success: boolean; reason?: string }
        if (result.success === false && result.reason === 'limit_reached') {
          return { limitReached: true }
        }
      }

      // If error is 'no_subscription' (free user or non-subscriber), allow through
      if (decrementError?.code === 'no_subscription') {
        // No-op — let the message pass (free-tier or unregistered user)
      }
    } catch {
      // Network error or unexpected failure — pass the message through rather than block
    }
  }

  // Proceed to real API
  const response = await fetch('/api/chat/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  })

  if (!response.ok) {
    if (response.status === 403) {
      const error = await response.json()
      if (error.error === 'limit_reached') {
        return { limitReached: true }
      }
    }
    throw new Error('Failed to send message')
  }

  return response.json()
}
