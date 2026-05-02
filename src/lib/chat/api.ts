export class LimitReachedError extends Error {
  constructor(
    public readonly remaining: number,
    public readonly plan: string
  ) {
    super('limit_reached')
    this.name = 'LimitReachedError'
  }
}

export interface SendChatMessageResult {
  text: string
  units_used: number
}

export async function sendChatMessage(
  content: string
): Promise<SendChatMessageResult> {
  const response = await fetch('/api/chat/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  })

  if (!response.ok) {
    if (response.status === 403) {
      const error = await response.json()
      if (error.error === 'limit_reached') {
        throw new LimitReachedError(0, error.plan ?? 'free')
      }
    }
    throw new Error('Failed to send message')
  }

  return response.json()
}
