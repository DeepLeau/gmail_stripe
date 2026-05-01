// No changes required — keeping as-is per brief instructions.
// The real API call logic is now in ChatInterface.tsx via decrementUnits() Server Action.
import { MOCK_RESPONSES, MOCK_RESPONSES_COUNT } from './responses'

const MIN_DELAY_MS = 500
const MAX_DELAY_MS = 1000

export function simulateDelay(): Promise<void> {
  const delay = Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS + 1)) + MIN_DELAY_MS
  return new Promise((resolve) => setTimeout(resolve, delay))
}

export function selectRandomResponse(): string {
  const index = Math.floor(Math.random() * MOCK_RESPONSES_COUNT)
  return MOCK_RESPONSES[index]
}

export async function sendMessage(_content: string): Promise<string> {
  await simulateDelay()
  return selectRandomResponse()
}

export interface ChatResponse {
  text: string
  units_used?: number
  model?: string
}

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
