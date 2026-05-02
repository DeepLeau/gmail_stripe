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
 * Result type for sendMessage with quota gating.
 */
export interface SendMessageResult {
  text: string
  limitReached?: boolean
}

/**
 * Sends a message through the /api/messages endpoint.
 * Handles quota checking (returns limitReached: true on 403) and fallback to mock.
 *
 * @param content - The user's message content
 * @returns Promise resolving to { text: string } or { limitReached: true }
 */
export async function sendMessage(content: string): Promise<SendMessageResult> {
  try {
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })

    if (response.status === 403) {
      const error = await response.json().catch(() => ({}))
      if (error.error === 'limit_reached') {
        return { text: '', limitReached: true }
      }
    }

    if (response.ok) {
      const data = await response.json()
      return { text: data.text || data.response || '' }
    }
  } catch {
    // Network error — fall through to mock
  }

  // Fallback to mock when API is unavailable or returns non-403 error
  await simulateDelay()
  return { text: selectRandomResponse() }
}

/**
 * Legacy alias for backward compatibility.
 * @deprecated Use sendMessage instead — this function bypasses quota gating.
 */
export async function sendChatMessage(content: string): Promise<{ text: string }> {
  const result = await sendMessage(content)
  if (result.limitReached) {
    throw new Error('limit_reached')
  }
  return { text: result.text }
}

/**
 * Mock implementation of the chat API (no quota).
 * @deprecated Use sendMessage instead
 */
export async function mockSendMessage(_content: string): Promise<string> {
  await simulateDelay()
  return selectRandomResponse()
}
