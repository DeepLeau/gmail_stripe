import { MOCK_RESPONSES, MOCK_RESPONSES_COUNT } from './responses'

/**
 * Simulated network delay range in milliseconds.
 * Isolated as constants for easy tuning and testing.
 */
const MIN_DELAY_MS = 500
const MAX_DELAY_MS = 1000

/**
 * Response type for sendMessage including quota information
 */
export interface SendMessageResponse {
  reply: string
  messagesUsed: number
  messagesLimit: number
  isOverLimit: boolean
}

/**
 * Call the billing usage increment endpoint.
 * Returns the updated usage info from the server.
 */
async function incrementUsage(): Promise<{
  messagesUsed: number
  messagesLimit: number
  isOverLimit: boolean
} | null> {
  try {
    const response = await fetch('/api/billing/usage/increment', {
      method: 'POST',
      credentials: 'same-origin',
    })

    if (!response.ok) {
      // If the endpoint doesn't exist or fails, continue without usage tracking
      return null
    }

    const data = await response.json()
    return {
      messagesUsed: data.messagesUsed ?? 0,
      messagesLimit: data.messagesLimit ?? 5,
      isOverLimit: data.isOverLimit ?? false,
    }
  } catch {
    // Network error - continue without usage tracking
    return null
  }
}

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
 * Mock implementation of the chat API with usage gating.
 *
 * @param content - The user's message content
 * @param userId - The user's ID (optional, for future real API usage)
 * @returns The AI response as a string (backward compatible) or SendMessageResponse with quota info
 */
export async function sendMessage(
  content: string,
  userId?: string
): Promise<string | SendMessageResponse> {
  // First, try to increment usage and check limits
  const usageInfo = await incrementUsage()

  // If usage info is available and user is over limit, return early
  if (usageInfo && usageInfo.isOverLimit) {
    return {
      reply: '',
      messagesUsed: usageInfo.messagesUsed,
      messagesLimit: usageInfo.messagesLimit,
      isOverLimit: true,
    }
  }

  // Proceed with the chat API call
  await simulateDelay()
  const reply = selectRandomResponse()

  // If we have usage info, include it in the response
  if (usageInfo) {
    return {
      reply,
      messagesUsed: usageInfo.messagesUsed,
      messagesLimit: usageInfo.messagesLimit,
      isOverLimit: usageInfo.isOverLimit,
    }
  }

  // Fallback for backward compatibility (no usage tracking available)
  return reply
}
