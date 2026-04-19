'use client'

import { useState, useRef, useEffect, type FormEvent } from 'react'
import type { ChatMessage } from '@/lib/chat/types'
import { sendMessage } from '@/lib/chat/mockApi'
import { ChatMessageBubble } from './ChatMessage'
import { TypingIndicator } from './TypingIndicator'
import { ChatInput } from './ChatInput'
import { AlertTriangle, Zap } from 'lucide-react'
import Link from 'next/link'

interface ChatInterfaceProps {
  initialPlan?: string
  initialMessagesRemaining?: number
  initialMessagesLimit?: number
}

interface DecrementResponse {
  allowed: boolean
  remaining: number
  limit?: number
  plan?: string
}

function QuotaBanner({
  plan,
  messagesRemaining,
  messagesLimit,
  isWarning
}: {
  plan: string
  messagesRemaining: number
  messagesLimit: number
  isWarning: boolean
}) {
  const usedMessages = messagesLimit - messagesRemaining
  const usagePercent = messagesLimit > 0 ? (usedMessages / messagesLimit) * 100 : 0

  const planLabels: Record<string, string> = {
    start: 'Start',
    scale: 'Scale',
    team: 'Team',
    free: 'Gratuit',
  }

  const planLabel = planLabels[plan] || plan.charAt(0).toUpperCase() + plan.slice(1)

  return (
    <div
      className="shrink-0 flex items-center gap-3 px-4 py-2.5 rounded-lg border transition-colors duration-200"
      style={{
        backgroundColor: isWarning ? 'rgba(245, 158, 11, 0.08)' : 'var(--surface)',
        borderColor: isWarning ? 'rgba(245, 158, 11, 0.2)' : 'var(--border)',
      }}
    >
      <Zap
        size={14}
        strokeWidth={1.5}
        style={{ color: isWarning ? '#f59e0b' : 'var(--accent)' }}
      />
      <span className="text-xs font-medium text-[var(--text-2)]">
        Plan {planLabel} —{' '}
        <span style={{ color: isWarning ? '#f59e0b' : 'var(--text)' }}>
          {messagesRemaining} messages restants
        </span>
      </span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${Math.min(usagePercent, 100)}%`,
            backgroundColor: isWarning ? '#f59e0b' : 'var(--accent)',
          }}
        />
      </div>
    </div>
  )
}

function QuotaExceededBanner() {
  return (
    <div
      className="shrink-0 flex items-center justify-between gap-4 px-4 py-3 rounded-lg border"
      style={{
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        borderColor: 'rgba(239, 68, 68, 0.15)',
      }}
    >
      <div className="flex items-center gap-3">
        <AlertTriangle size={18} strokeWidth={1.5} style={{ color: 'var(--red)' }} />
        <span className="text-sm font-medium text-[var(--text)]">
          Limite atteinte — Upgrade pour continuer
        </span>
      </div>
      <Link
        href="/#pricing"
        className="h-8 px-4 flex items-center justify-center gap-2 rounded-lg text-xs font-medium transition-all duration-150"
        style={{
          backgroundColor: 'var(--accent)',
          color: '#fff',
        }}
      >
        Changer de plan
      </Link>
    </div>
  )
}

export function ChatInterface({
  initialPlan = 'free',
  initialMessagesRemaining = 100,
  initialMessagesLimit = 100,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [plan, setPlan] = useState(initialPlan)
  const [messagesRemaining, setMessagesRemaining] = useState(initialMessagesRemaining)
  const [messagesLimit] = useState(initialMessagesLimit)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const isQuotaExceeded = messagesRemaining <= 0
  const isWarning = !isQuotaExceeded && messagesLimit > 0 && messagesRemaining <= Math.max(1, Math.floor(messagesLimit * 0.2))

  // Scroll automatique vers le bas après chaque message
  useEffect(() => {
    if (messages.length > 0) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      })
    }
  }, [messages.length])

  const handleDecrementAndCheck = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/messages/decrement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!res.ok) {
        return true // Allow sending on error
      }

      const data: DecrementResponse = await res.json()

      if (!data.allowed) {
        setMessagesRemaining(0)
        return false
      }

      setMessagesRemaining(data.remaining)
      if (data.plan) setPlan(data.plan)
      return true
    } catch {
      // On error, allow the message to be sent
      return true
    }
  }

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault()

    const trimmed = inputValue.trim()
    if (!trimmed || isLoading || isQuotaExceeded) return

    // Check and decrement quota first
    const allowed = await handleDecrementAndCheck()
    if (!allowed) return

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
    <div className="flex flex-col h-full py-6 gap-4">
      {/* Quota Banner */}
      {isQuotaExceeded ? (
        <QuotaExceededBanner />
      ) : (
        <QuotaBanner
          plan={plan}
          messagesRemaining={messagesRemaining}
          messagesLimit={messagesLimit}
          isWarning={isWarning}
        />
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
      <div className="shrink-0">
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={() => handleSubmit()}
          isLoading={isLoading}
          disabled={isQuotaExceeded}
        />
      </div>
    </div>
  )
}
