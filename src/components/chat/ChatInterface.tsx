'use client'

import { useState, useRef, useEffect, type FormEvent } from 'react'
import type { ChatMessage } from '@/lib/chat/types'
import { ChatMessageBubble } from './ChatMessage'
import { TypingIndicator } from './TypingIndicator'
import { ChatInput } from './ChatInput'

interface SubscriptionData {
  plan: string | null
  units_used: number
  units_limit: number | null
  units_remaining: number | null
  status: string
}

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [remaining, setRemaining] = useState<number | null>(null)
  const [limitReached, setLimitReached] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll automatique vers le bas
  useEffect(() => {
    if (messages.length > 0) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      })
    }
  }, [messages.length])

  // Charger le quota au mount
  useEffect(() => {
    async function loadQuota() {
      try {
        const res = await fetch('/api/subscription', { cache: 'no-store' })
        if (res.ok) {
          const data: SubscriptionData = await res.json()
          const r =
            data.units_limit !== null && data.units_limit >= 0
              ? data.units_limit - data.units_used
              : null
          setRemaining(r)
          if (r !== null && r <= 0) {
            setLimitReached(true)
          }
        }
      } catch {
        // non-blocking — le chat reste fonctionnel sans quota display
      }
    }
    loadQuota()
  }, [])

  async function handleSubmit(e?: FormEvent) {
    e?.preventDefault()

    const trimmed = inputValue.trim()
    if (!trimmed || isLoading) return

    if (limitReached) return

    // Ajout du message utilisateur
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
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: trimmed }),
      })

      if (res.status === 403) {
        const err = await res.json()
        if (err.error === 'limit_reached') {
          setLimitReached(true)
          setRemaining(0)
          return
        }
      }

      if (!res.ok) throw new Error('Request failed')

      const data = await res.json()

      if (remaining !== null) {
        setRemaining((r) => (r !== null ? Math.max(0, r - 1) : null))
        if (data.units_used !== undefined && data.units_limit !== undefined) {
          const newRemaining = data.units_limit - data.units_used
          if (newRemaining <= 0) {
            setLimitReached(true)
          }
        }
      }

      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'ai',
        content: data.text ?? data.response ?? '',
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, aiMessage])
    } catch {
      // Erreur silencieuse
    } finally {
      setIsLoading(false)
    }
  }

  const computedRemaining = limitReached ? 0 : remaining

  return (
    <div className="flex flex-col h-full py-6">
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

      {/* Message limite atteinte */}
      {limitReached && (
        <div className="shrink-0 mb-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800 flex items-start gap-2.5">
          <svg
            className="w-4 h-4 mt-0.5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
          <div>
            <span className="font-medium">Limite atteinte.</span>{' '}
            <a href="/#pricing" className="underline hover:no-underline">
              Passe à un plan supérieur
            </a>{' '}
            pour continuer.
          </div>
        </div>
      )}

      {/* Input fixe en bas */}
      <div className="shrink-0 pt-4">
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={() => handleSubmit()}
          isLoading={isLoading}
          remaining={computedRemaining}
          disabled={limitReached || isLoading}
          placeholder={
            limitReached
              ? 'Limite de messages atteinte'
              : remaining !== null
              ? remaining === 1
                ? '1 message restant — pose ta question'
                : `${remaining} messages restants`
              : 'Pose ta question…'
          }
        />
      </div>
    </div>
  )
}
