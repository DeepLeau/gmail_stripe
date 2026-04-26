'use client'

import { useState, useRef, useEffect, type FormEvent } from 'react'
import type { ChatMessage } from '@/lib/chat/types'
import { sendMessage } from '@/lib/chat/mockApi'
import { ChatMessageBubble } from './ChatMessage'
import { TypingIndicator } from './TypingIndicator'
import { ChatInput } from './ChatInput'

interface BillingStatus {
  plan: string | null
  messagesLimit: number | null
  messagesUsed: number | null
  status: string | null
}

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [billing, setBilling] = useState<BillingStatus | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch billing status on mount
  useEffect(() => {
    async function fetchBilling() {
      try {
        const res = await fetch('/api/billing/status')
        if (res.ok) {
          const data = await res.json()
          setBilling(data)
        }
      } catch {
        // Silently ignore — billing is supplementary
      }
    }
    fetchBilling()
  }, [])

  // Scroll automatique vers le bas après chaque message
  useEffect(() => {
    if (messages.length > 0) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      })
    }
  }, [messages.length])

  const isLimitReached =
    billing !== null &&
    billing.plan !== null &&
    billing.plan !== '' &&
    billing.messagesLimit !== null &&
    billing.messagesUsed !== null &&
    billing.messagesUsed >= billing.messagesLimit

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault()

    const trimmed = inputValue.trim()
    if (!trimmed || isLoading) return

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
    } catch {
      // Erreur silencieuse — could add error state here
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full py-6">
      {/* Plan banner */}
      {billing &&
        billing.plan !== null &&
        billing.plan !== '' &&
        billing.messagesLimit !== null &&
        billing.messagesUsed !== null && (
          <div className="shrink-0 mb-4 px-1">
            <div className="flex items-center justify-between text-xs px-3 py-2 rounded-lg"
              style={{
                backgroundColor: 'var(--bg)',
                border: '1px solid var(--border)',
                color: 'var(--text-2)',
              }}>
              <span>
                Plan <span className="font-medium" style={{ color: 'var(--text)' }}>{billing.plan}</span>
                {' · '}
                <span style={{ color: isLimitReached ? 'var(--red)' : 'var(--text-2)' }}>
                  {billing.messagesUsed}/{billing.messagesLimit}
                </span>
                {' messages'}
              </span>
            </div>
          </div>
        )}

      {/* Upgrade prompt */}
      {isLimitReached && (
        <div className="shrink-0 mb-4 px-1">
          <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-sm"
            style={{
              backgroundColor: 'var(--accent-light)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              color: 'var(--accent)',
            }}>
            <span>
              Vous avez atteint votre limite de {billing!.messagesLimit} messages.{' '}
              <span className="font-medium">✨ Passez à un plan supérieur →</span>
            </span>
            <a
              href="/#pricing"
              onClick={(e) => {
                e.preventDefault()
                const pricing = document.getElementById('pricing')
                pricing?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="shrink-0 h-8 px-3 flex items-center rounded-lg text-xs font-medium"
              style={{
                backgroundColor: 'var(--accent)',
                color: '#fff',
              }}
            >
              Mettre à niveau
            </a>
          </div>
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
          disabled={isLimitReached}
        />
      </div>
    </div>
  )
}
