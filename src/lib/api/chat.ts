/**
 * Chat API client.
 * Calls the real /api/chat/send endpoint (managed by the pipeline Stripe webhook).
 */

export interface ChatMessageResponse {
  text: string
  remaining: number
  plan: string
}

export async function sendChatMessage(
  content: string
): Promise<ChatMessageResponse> {
  const response = await fetch('/api/chat/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  })

  if (!response.ok) {
    if (response.status === 403) {
      const body = await response.json().catch(() => ({}))
      if (body.error === 'limit_reached') {
        throw new Error('limit_reached')
      }
    }
    throw new Error('Failed to send message')
  }

  return response.json()
}
