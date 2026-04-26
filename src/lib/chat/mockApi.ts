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

export interface SendMessageOptions {
  messagesUsed: number
  messagesLimit: number
}

/**
 * Mock implementation of the chat API.
 *
 * Current signature (mock):
 *   async function sendMessage(content: string, options?: SendMessageOptions): Promise<string>
 *
 * Target signature (future replacement with real API):
 *   async function sendMessage(content: string): Promise<{ text: string; model?: string }>
 *
 * @param _content - The user's message content (ignored in mock, kept for signature compatibility)
 * @param options  - Optional usage quota info for client-side gating
 * @returns The AI response as a plain string, or throws if limit is reached
 */
export async function sendMessage(
  _content: string,
  options?: SendMessageOptions
): Promise<string> {
  // Client-side gating: block if limit reached
  if (
    options &&
    options.messagesLimit > 0 &&
    options.messagesUsed >= options.messagesLimit
  ) {
    throw new Error('LIMIT_REACHED')
  }

  await simulateDelay()
  return selectRandomResponse()
}
