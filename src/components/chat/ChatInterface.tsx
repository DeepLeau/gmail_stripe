'use client'

import { useState, useRef, useEffect, type FormEvent } from 'react'
import Link from 'next/link'
import type { ChatMessage } from '@/lib/chat/types'
import { sendMessage } from '@/lib/chat/mockApi'
import { ChatMessageBubble } from './ChatMessage'
import { TypingIndicator } from './TypingIndicator'
import { ChatInput } from './ChatInput'

type QuotaStatus = {
  exceeded: boolean
  plan: string
}

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [quotaStatus, setQuotaStatus] = useState<QuotaStatus>({ exceeded: false, plan: 'free' })
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
    if (!trimmed || isLoading || quotaStatus.exceeded) return

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

      await decrementQuota()
    } catch {
      // erreur silencieuse
    } finally {
      setIsLoading(false)
    }
  }

  async function decrementQuota() {
    try {
      const res = await fetch('/api/messages/decrement', { method: 'POST' })

      if (res.status === 403) {
        const data = await res.json()
        setQuotaStatus({ exceeded: true, plan: data.plan ?? 'free' })
        return
      }

      if (!res.ok) {
        const data = await res.json()
        if (data.allowed === false) {
          setQuotaStatus({ exceeded: true, plan: data.plan ?? 'free' })
        }
      }
    } catch {
      // erreur silencieuse
    }
  }

  return (
    <div className="flex flex-col h-full py-6">
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

      {quotaStatus.exceeded && (
        <div
          className="shrink-0 mx-auto max-w-md mb-3 px-4 py-3 rounded-xl flex items-start gap-3 text-sm"
          style={{
            backgroundColor: 'color-mix(in srgb, #f97316 12%, transparent)',
            border: '1px solid #f97316',
            color: '#c2410c',
          }}
        >
          <span className="mt-0.5 shrink-0">⚠️</span>
          <p>
            Quota épuisé —{' '}
            <Link
              href="/#pricing"
              className="underline font-medium hover:no-underline"
              style={{ color: '#c2410c' }}
            >
              Upgrade vers Scale ou Team
            </Link>{' '}
            pour continuer.
          </p>
        </div>
      )}

      <div className="shrink-0 pt-4">
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={() => handleSubmit()}
          isLoading={isLoading}
          disabled={quotaStatus.exceeded}
          disabledReason="Quota épuisé — upgrade pour continuer"
        />
      </div>
    </div>
  )
}
