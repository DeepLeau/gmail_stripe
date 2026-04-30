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
 * API-compatible chat message sender.
 * Calls the real /api/chat/send endpoint.
 *
 * @param content - The user's message content
 * @param _userId - User ID (kept for API compatibility, not used in mock)
 * @returns Promise resolving to ChatResponse with AI text and units_used
 * @throws Error with message 'limit_reached' when quota is exhausted
 */
export async function sendChatMessage(
  content: string,
  _userId?: string
): Promise<ChatResponse> {
  const response = await fetch('/api/chat/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  })

  if (!response.ok) {
    if (response.status === 403) {
      const error = await response.json()
      if (error.error === 'limit_reached') {
        throw new Error('limit_reached')
      }
    }
    throw new Error('Failed to send message')
  }

  return response.json()
}

/**
 * Fetches the current remaining units for the authenticated user.
 * @returns Promise resolving to remaining units count, or null if not authenticated
 */
export async function getRemaining(): Promise<number | null> {
  try {
    const res = await fetch('/api/subscription', { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    return data.units_remaining ?? null
  } catch {
    return null
  }
}
