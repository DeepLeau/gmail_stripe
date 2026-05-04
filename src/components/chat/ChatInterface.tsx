'use client'

import { useState, useRef, useEffect, type FormEvent } from 'react'
import type { ChatMessage } from '@/lib/chat/types'
import { sendMessage } from '@/lib/chat/mockApi'
import { ChatMessageBubble } from './ChatMessage'
import { TypingIndicator } from './TypingIndicator'
import { ChatInput } from './ChatInput'

type SubscriptionStatus = {
  plan: string | null
  units_used: number
  units_limit: number | null
  units_remaining: number | null
  status: string
  current_period_end: string | null
} | null

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Subscription status
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>(null)
  const [statusError, setStatusError] = useState<string | null>(null)

  // Fetch subscription status on mount
  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch('/api/chat/status', { cache: 'no-store' })
        if (!res.ok) throw new Error('Erreur de chargement du statut')
        const data = await res.json()
        setSubscriptionStatus(data)
      } catch {
        setStatusError('Impossible de charger votre quota. Les réponses sont limitées.')
      } finally {
        setLoadingStatus(false)
      }
    }
    fetchStatus()
  }, [])

  // Scroll automatique vers le bas après chaque message
  useEffect(() => {
    if (messages.length > 0) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      })
    }
  }, [messages.length])

  const isLimitReached = subscriptionStatus?.units_remaining === 0

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault()

    const trimmed = inputValue.trim()
    if (!trimmed || isLoading || isLimitReached) return

    // Ajout du message utilisateur
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInputValue('')

    // Appel API
    setIsLoading(true)
    try {
      const response = await sendMessage(trimmed)
      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'ai',
        content: response,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, aiMessage])

      // Mise à jour du compteur local après un message envoyé
      if (subscriptionStatus) {
        setSubscriptionStatus((prev) =>
          prev
            ? {
                ...prev,
                units_used: prev.units_used + 1,
                units_remaining:
                  prev.units_remaining !== null
                    ? Math.max(0, prev.units_remaining - 1)
                    : null,
              }
            : prev
        )
      }
    } catch {
      // Erreur silencieuse
    } finally {
      setIsLoading(false)
    }
  }

  const planLabel = subscriptionStatus?.plan
    ? subscriptionStatus.plan.charAt(0).toUpperCase() + subscriptionStatus.plan.slice(1)
    : null

  const remainingLabel =
    subscriptionStatus?.units_remaining !== null && subscriptionStatus?.units_remaining !== undefined
      ? `${subscriptionStatus.units_remaining} messages restants`
      : null

  return (
    <div className="flex flex-col h-full py-6">
      {/* Header avec statut d'abonnement */}
      <div className="shrink-0 px-4 mb-4">
        {/* Erreur de chargement du statut */}
        {statusError && (
          <div className="mb-3 flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--yellow) 10%, transparent)',
              color: 'var(--yellow)',
              border: '1px solid color-mix(in srgb, var(--yellow) 30%, transparent)',
            }}>
            <span>{statusError}</span>
            <button
              onClick={() => setStatusError(null)}
              className="ml-auto underline hover:no-underline"
            >
              ✕
            </button>
          </div>
        )}

        {/* Badge plan + quota */}
        {loadingStatus ? (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full">
            <div
              className="w-20 h-3 rounded animate-pulse"
              style={{ backgroundColor: 'var(--border)' }}
            />
          </div>
        ) : planLabel && remainingLabel ? (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{
              backgroundColor: 'var(--accent-light)',
              color: 'var(--accent)',
              border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)',
            }}>
            <span>{planLabel}</span>
            <span style={{ color: 'var(--text-3)' }}>·</span>
            <span>{remainingLabel}</span>
          </div>
        ) : null}
      </div>

      {/* Zone des messages */}
      <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">
              Pose tes questions à tes emails
            </p>
            <p className="text-xs text-gray-500 max-w-xs">
              Dicte une question en langage naturel. L&apos;IA explore tes emails et te répond.
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
          disabled={isLimitReached}
        />
      </div>
    </div>
  )
}
