'use client'

import { useState, useRef, useEffect } from 'react'
import type { ChatMessage } from '@/lib/chat/types'
import { sendChatMessage } from '@/lib/chat/mockApi'
import { ChatMessageBubble } from './ChatMessage'
import { TypingIndicator } from './TypingIndicator'
import { ChatInput } from './ChatInput'
import { QuotaDisplay } from './QuotaDisplay'
import type { SubscriptionData } from '@/lib/stripe/config'

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [limitReached, setLimitReached] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch quota au montage
  useEffect(() => {
    async function fetchQuota() {
      try {
        const res = await fetch('/api/subscription', { cache: 'no-store' })
        if (res.ok) {
          const data: SubscriptionData = await res.json()
          setSubscription(data)
          setLimitReached(data.units_remaining === 0)
        }
      } catch {
        // Silencieux — le chat reste fonctionnel sans quota display
      }
    }
    fetchQuota()
  }, [])

  // Scroll automatique vers le bas après chaque message
  useEffect(() => {
    if (messages.length > 0) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      })
    }
  }, [messages.length])

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()

    const trimmed = inputValue.trim()
    if (!trimmed || isLoading || limitReached) return

    // Ajout du message utilisateur
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInputValue('')

    // Appel API vers /api/chat/send
    setIsLoading(true)
    try {
      const response = await sendChatMessage(trimmed)
      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'ai',
        content: response.text,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, aiMessage])

      // Met à jour le quota après chaque message envoyé
      if (subscription) {
        setSubscription((prev) =>
          prev
            ? {
                ...prev,
                units_used: prev.units_used + 1,
                units_remaining:
                  prev.units_remaining !== null ? Math.max(0, prev.units_remaining - 1) : null,
              }
            : null
        )
      }
    } catch (err) {
      if (err instanceof Error && err.message === 'limit_reached') {
        setLimitReached(true)
        // Met à jour le quota localement pour refléter 0 remaining
        setSubscription((prev) =>
          prev ? { ...prev, units_remaining: 0 } : null
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full py-6">
      {/* Header avec QuotaDisplay */}
      {subscription && (
        <div className="shrink-0 mb-4">
          <QuotaDisplay subscription={subscription} />
        </div>
      )}

      {/* Limite atteinte */}
      {limitReached && (
        <div className="shrink-0 mb-4 mx-4 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
          <strong>Limite atteinte</strong> — Vous avez utilisé tous vos messages du mois. Passez à un plan supérieur pour continuer.
        </div>
      )}

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
          disabled={limitReached}
        />
      </div>
    </div>
  )
}
