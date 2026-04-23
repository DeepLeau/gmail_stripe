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
  const delay =
    Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS + 1)) + MIN_DELAY_MS
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
 * Result shape returned when the message limit has been reached.
 * The caller should display a "limit reached" banner and skip the API call.
 */
export interface LimitReachedResult {
  limitReached: true
  remaining: 0
}

/**
 * Mock implementation of the chat API.
 *
 * Before sending the message, calls decrement_message_count RPC atomically.
 * - If the user has no active subscription (free tier), returns success.
 * - If the user has remaining messages, decrements and proceeds.
 * - If the user has exhausted their quota, returns { limitReached: true, remaining: 0 }
 *   without calling the underlying API.
 *
 * @param content       - The user's message content (ignored in mock, kept for signature compatibility)
 * @param userId        - UUID of the authenticated user. Required for quota gating.
 *                        If omitted, the call proceeds without checking limits (free tier behavior).
 * @returns The AI response as a plain string, or a LimitReachedResult on quota exhaustion.
 */
export async function sendMessage(
  _content: string,
  userId?: string
): Promise<string | LimitReachedResult> {
  // ─── Quota gating ───────────────────────────────────────────────────────────
  if (userId) {
    const supabase = createClient()
    if (!supabase) {
      // Client not initialized (env vars missing) — allow through (fail open for dev)
      console.warn('[sendMessage] Supabase client not initialized, skipping quota check.')
    } else {
      const { data, error } = await supabase.rpc('decrement_message_count', {
        p_user_id: userId,
      })

      if (error) {
        console.error('[sendMessage] decrement_message_count RPC error:', error.message)
        // Fail open — if the RPC call fails (e.g. network issue),
        // allow the message through rather than blocking the user.
      } else if (data && data.length > 0) {
        const row = data[0] as { success: boolean; remaining: number }

        if (row.success === false || row.remaining < 0) {
          // Quota exhausted — do not call the AI API.
          // Return a special result that ChatInterface can handle.
          return { limitReached: true, remaining: 0 }
        }
      }
    }
  }

  // ─── Normal path — AI response ──────────────────────────────────────────────
  await simulateDelay()
  return selectRandomResponse()
}
