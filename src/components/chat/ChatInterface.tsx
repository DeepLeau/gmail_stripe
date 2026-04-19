'use client'

import { useState, useRef, useEffect, type FormEvent } from 'react'
import { Zap } from 'lucide-react'
import Link from 'next/link'
import type { ChatMessage } from '@/lib/chat/types'
import { sendMessage } from '@/lib/chat/mockApi'
import { ChatMessageBubble } from './ChatMessage'
import { TypingIndicator } from './TypingIndicator'
import { ChatInput } from './ChatInput'

type BillingInfo = {
  plan: string
  messages_used: number
  messages_limit: number
  subscription_status: string
}

const PLAN_COLORS: Record<string, string> = {
  start: '#3b82f6', // blue
  scale: '#8b5cf6', // violet
  team: '#f59e0b', // amber
  free: '#6b7280', // gray
}

function getPlanColor(plan: string): string {
  return PLAN_COLORS[plan.toLowerCase()] ?? PLAN_COLORS.free
}

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [billing, setBilling] = useState<BillingInfo | null>(null)
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch billing info
  async function fetchBilling() {
    try {
      const res = await fetch('/api/billing')
      if (res.ok) {
        const data: BillingInfo = await res.json()
        setBilling(data)
        setIsQuotaExceeded(data.messages_used >= data.messages_limit)
      }
    } catch {
      // Silently ignore billing errors
    }
  }

  // Fetch billing on mount
  useEffect(() => {
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

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault()

    const trimmed = inputValue.trim()
    if (!trimmed || isLoading || isQuotaExceeded) return

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

      // Refetch billing after successful message
      await fetchBilling()
    } catch {
      // Erreur silencieuse — could add error state here
    } finally {
      setIsLoading(false)
    }
  }

  const messagesRemaining = billing
    ? billing.messages_limit - billing.messages_used
    : null
  const planColor = billing ? getPlanColor(billing.plan) : PLAN_COLORS.free

  return (
    <div className="flex flex-col h-full py-6">
      {/* Header avec badge quota */}
      <div className="shrink-0 flex items-center justify-between mb-4">
        <span className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>
          Conversation
        </span>
        {messagesRemaining !== null && (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: `${planColor}15`,
              color: planColor,
              border: `1px solid ${planColor}30`,
            }}
          >
            <Zap size={11} strokeWidth={2} />
            {messagesRemaining} messages restants
          </span>
        )}
      </div>

      {/* Zone des messages */}
      <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--accent-light)' }}>
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                style={{ color: 'var(--accent)' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                />
              </svg>
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
              Pose tes questions à tes emails
            </p>
            <p className="text-xs max-w-xs" style={{ color: 'var(--text-2)', lineHeight: 1.6 }}>
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

      {/* Input fixe en bas ou bannière d'upgrade */}
      <div className="shrink-0 pt-4">
        {isQuotaExceeded ? (
          <div
            className="flex flex-col items-center gap-3 p-4 rounded-xl text-center"
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
            }}
          >
            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
              Tu as atteint ton quota mensuel de messages
            </p>
            <p className="text-xs" style={{ color: 'var(--text-2)', lineHeight: 1.6 }}>
              Débloque plus de questions en passant à un plan supérieur.
            </p>
            <Link
              href="/#pricing"
              className="h-9 px-5 flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors duration-150"
              style={{
                backgroundColor: 'var(--accent)',
                color: '#fff',
              }}
            >
              <Zap size={14} strokeWidth={1.5} />
              <span>Voir les plans</span>
            </Link>
          </div>
        ) : (
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSubmit={() => handleSubmit()}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  )
}
