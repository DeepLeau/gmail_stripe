/**
 * Wrapper client-side pour l'API chat.
 * Appelle /api/chat/send avec le contenu et l'historique de conversation.
 */
import type { ChatMessage } from './types'

export interface SendMessageResult {
  text: string
  model?: string
  limitReached?: boolean
}

/**
 * Envoie un message au serveur qui le transmet à OpenRouter.
 *
 * @param content - Le message de l'utilisateur
 * @param history - Les messages précédents au format API { role: 'user'|'assistant', content: string }
 * @returns La réponse texte du modèle ou { limitReached: true }
 */
export async function sendMessage(
  content: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<SendMessageResult> {
  const response = await fetch('/api/chat/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, history }),
  })

  if (!response.ok) {
    if (response.status === 403) {
      const error = await response.json().catch(() => ({ error: 'limit_reached' }))
      if (error.error === 'limit_reached') {
        return { text: '', limitReached: true }
      }
    }
    throw new Error('Failed to send message')
  }

  return response.json()
}
