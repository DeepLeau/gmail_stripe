'use client'

import { useState, useRef, useEffect, type FormEvent } from 'react'
import type { ChatMessage } from '@/lib/chat/types'
import { sendMessage } from '@/lib/chat/mockApi'
import { ChatMessageBubble } from './ChatMessage'
import { TypingIndicator } from './TypingIndicator'
import { ChatInput } from './ChatInput'
import { QuotaDisplay } from '@/components/subscription/QuotaDisplay'

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Quota state
  const [quotaLoading, setQuotaLoading] = useState(true)
  const [plan, setPlan] = useState<string | null>(null)
  const [unitsUsed, setUnitsUsed] = useState(0)
  const [unitsLimit, setUnitsLimit] = useState<number | null>(null)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('free')

  // Fetch quota on mount
  useEffect(() => {
    async function fetchQuota() {
      try {
        const res = await fetch('/api/subscription/quota', { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setPlan(data.plan ?? null)
          setUnitsUsed(data.units_used ?? 0)
          setUnitsLimit(data.units_limit ?? null)
          setRemaining(data.units_remaining ?? 0)
          setSubscriptionStatus(data.status ?? 'free')
        }
      } catch {
        // quota remains null/0 — keep UI neutral
      } finally {
        setQuotaLoading(false)
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

  const atLimit = remaining !== null && remaining <= 0

  async function handleSubmit(e?: FormEvent) {
    e?.preventDefault()

    const trimmed = inputValue.trim()
    if (!trimmed || isLoading) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInputValue('')

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

      if (!atLimit) {
        try {
          const res = await fetch('/api/subscription/decrement', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ count: 1 }),
            credentials: 'include',
          })
          if (res.ok) {
            const data = await res.json()
            setRemaining(data.units_remaining ?? null)
            setUnitsUsed(data.units_used ?? unitsUsed + 1)
          }
        } catch {
          // silent — quota decrement is best-effort
        }
      }
    } catch {
      // Erreur silencieuse
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full py-6">
      {/* Quota display — top bar */}
      {!quotaLoading && (
        <div className="shrink-0 mb-4 px-1">
          <QuotaDisplay
            plan={plan}
            unitsUsed={unitsUsed}
            unitsLimit={unitsLimit}
            remaining={remaining}
            status={subscriptionStatus}
          />
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
          remaining={remaining}
          onLimitReached={atLimit ? undefined : undefined}
        />
      </div>
    </div>
  )
}
