import { MOCK_RESPONSES, MOCK_RESPONSES_COUNT } from './responses'
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

/**
 * Result type for sendMessage — supports limitReached flag.
 */
export type SendMessageResult =
  | { limitReached: true }
  | { limitReached: false; text: string }

/**
 * Attempts to decrement the user's message counter via RPC.
 * Returns false if the user has no more messages remaining (limit reached).
 * Silently returns true on any error (fallback: allow the call).
 */
async function tryDecrementUnits(): Promise<boolean> {
  try {
    const supabase = createClient()
    if (!supabase) return true
    const { data, error } = await supabase.rpc('decrement_units')
    if (error) return true // Allow on RPC error
    const result = data as { remaining?: number } | null
    if (result && typeof result.remaining === 'number' && result.remaining <= 0) {
      return false // Limit reached
    }
    return true
  } catch {
    return true // Allow on network error
  }
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
  const allowed = await tryDecrementUnits()
  if (!allowed) {
    return selectRandomResponse()
  }

  await simulateDelay()
  return selectRandomResponse()
}
