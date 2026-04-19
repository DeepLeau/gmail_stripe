'use client'

import { useState, useRef, useEffect, type FormEvent } from 'react'
import type { ChatMessage } from '@/lib/chat/types'
import { sendMessage } from '@/lib/chat/mockApi'
import { ChatMessageBubble } from './ChatMessage'
import { TypingIndicator } from './TypingIndicator'
import { ChatInput } from './ChatInput'
import { UsageBanner } from '@/components/ui/UsageBanner'

type SubscriptionInfo = {
  plan: string
  quotaUsed: number
  quotaLimit: number
  quotaRenewedAt: string
  status: string
}

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [quotaExceeded, setQuotaExceeded] = useState(false)
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const [loadingSubscription, setLoadingSubscription] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Charger l'abonnement au mount
  useEffect(() => {
    async function loadSubscription() {
      try {
        const res = await fetch('/api/subscription')
        if (res.ok) {
          const data = await res.json()
          setSubscription(data)
          if (data.quotaUsed >= data.quotaLimit) {
            setQuotaExceeded(true)
          }
        }
      } catch {
        // Silencieux : le chat reste fonctionnel sans quota
      } finally {
        setLoadingSubscription(false)
      }
    }
    loadSubscription()
  }, [])

  // Scroll automatique vers le bas après chaque message
  useEffect(() => {
    if (messages.length > 0) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      })
    }
  }, [messages.length])

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault()

    const trimmed = inputValue.trim()
    if (!trimmed || isLoading || quotaExceeded) return

    // Ajout du message utilisateur
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInputValue('')

    // Appel API de décrement
    setIsLoading(true)
    try {
      const decrementRes = await fetch('/api/messages/decrement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: userMessage.id }),
      })

      if (decrementRes.status === 429) {
        setQuotaExceeded(true)
        setMessages((prev) => prev.slice(0, -1))
        return
      }

      if (!decrementRes.ok) {
        throw new Error('Erreur de quota')
      }

      const { remaining } = await decrementRes.json()

      // Mettre à jour le compteur local
      if (subscription) {
        setSubscription((prev) =>
          prev ? { ...prev, quotaUsed: prev.quotaLimit - remaining } : null
        )
        if (remaining === 0) {
          setQuotaExceeded(true)
        }
      }

      // Appel à l'API mock pour la réponse IA
      const response = await sendMessage(trimmed)
      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'ai',
        content: response,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, aiMessage])
    } catch {
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full py-6">
      {/* UsageBanner si quota épuisé */}
      {quotaExceeded && subscription && (
        <UsageBanner
          quotaUsed={subscription.quotaUsed}
          quotaLimit={subscription.quotaLimit}
        />
      )}

      {/* Zone des messages */}
      <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
        {messages.length === 0 && !loadingSubscription && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: 'rgba(99,102,241,0.08)' }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                style={{ color: 'var(--accent-hi)' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                />
              </svg>
            </div>
            <p
              className="text-sm font-medium mb-1"
              style={{ color: 'var(--text)' }}
            >
              Pose tes questions à tes emails
            </p>
            <p
              className="text-xs max-w-xs"
              style={{ color: 'var(--text-3)' }}
            >
              Dicte une question en langage naturel. L&apos;IA explore tes
              emails et te répond.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessageBubble key={msg.id} message={msg} />
        ))}

        {isLoading && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Input fixe en bas */}
      <div className="shrink-0 pt-4">
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={() => handleSubmit()}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
