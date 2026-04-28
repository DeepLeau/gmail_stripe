'use client'

import { useState, useRef, useEffect, type FormEvent } from 'react'
import type { ChatMessage } from '@/lib/chat/types'
import { ChatMessageBubble } from './ChatMessage'
import { TypingIndicator } from './TypingIndicator'
import { ChatInput } from './ChatInput'
import { UsageBar } from '@/components/chat/UsageBar'
import type { SubscriptionData } from '@/lib/stripe/config'
import { UNIT_LABEL, UNIT_LABEL_PLURAL } from '@/lib/stripe/config'

interface ChatInterfaceProps {
  subscription?: SubscriptionData | null
}

interface SendMessageResponse {
  text: string
  units_used?: number
}

interface LimitReachedOverlayProps {
  planName: string | null
  onUpgrade: () => void
}

function LimitReachedOverlay({ planName, onUpgrade }: LimitReachedOverlayProps) {
  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center rounded-xl"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="flex flex-col items-center gap-4 p-8 rounded-2xl text-center max-w-sm mx-4"
        style={{ backgroundColor: 'var(--bg)', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
      >
        {/* Icon */}
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'var(--accent-light)' }}
        >
          <svg
            className="w-7 h-7"
            style={{ color: 'var(--accent)' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>

        {/* Title */}
        <div>
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}
          >
            Limite de {UNIT_LABEL_PLURAL.toLowerCase()} atteinte
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-2)', lineHeight: 1.6 }}>
            {planName
              ? `Votre plan ${planName} a atteint sa limite mensuelle.`
              : 'Vous avez atteint votre limite de messages mensuelle.'}
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={onUpgrade}
          className="w-full h-11 px-6 rounded-xl text-sm font-medium transition-all duration-150 flex items-center justify-center gap-2"
          style={{
            backgroundColor: 'var(--accent)',
            color: '#fff',
            boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent-hi)'
            ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent)'
            ;(e.currentTarget as HTMLButtonElement).style.transform = ''
          }}
        >
          <span>Passer à un plan supérieur</span>
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export function ChatInterface({ subscription }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [limitReached, setLimitReached] = useState(false)
  const [localUnitsUsed, setLocalUnitsUsed] = useState(subscription?.units_used ?? 0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Sync local units with subscription changes
  useEffect(() => {
    if (subscription?.units_used !== undefined) {
      setLocalUnitsUsed(subscription.units_used)
    }
  }, [subscription?.units_used])

  // Check if limit is already reached on mount
  useEffect(() => {
    const remaining = subscription?.units_remaining ?? null
    if (remaining !== null && remaining <= 0) {
      setLimitReached(true)
    }
  }, [subscription?.units_remaining])

  // Scroll automatique vers le bas après chaque message
  useEffect(() => {
    if (messages.length > 0) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      })
    }
  }, [messages.length])

  async function handleSubmit(e?: FormEvent) {
    e?.preventDefault()

    const trimmed = inputValue.trim()
    if (!trimmed || isLoading) return

    // Check limit before sending
    const remaining = subscription?.units_remaining ?? null
    if (remaining !== null && remaining <= 0) {
      setLimitReached(true)
      return
    }

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
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: trimmed }),
      })

      if (response.status === 403) {
        const errorData = await response.json()
        if (errorData.error === 'limit_reached') {
          setLimitReached(true)
          // Remove the user message we just added since the request was blocked
          setMessages((prev) => prev.slice(0, -1))
          return
        }
      }

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du message')
      }

      const data: SendMessageResponse = await response.json()

      // Update local units_used from server response
      if (data.units_used !== undefined) {
        setLocalUnitsUsed(data.units_used)
        // Also check if we've hit the limit
        const newRemaining = subscription?.units_limit !== null && subscription?.units_limit !== undefined
          ? Math.max(0, subscription.units_limit - data.units_used)
          : null
        if (newRemaining !== null && newRemaining <= 0) {
          setLimitReached(true)
        }
      }

      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'ai',
        content: data.text,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, aiMessage])
    } catch {
      // Remove the user message on error
      setMessages((prev) => prev.slice(0, -1))
      // Could add error state here
    } finally {
      setIsLoading(false)
    }
  }

  function handleUpgrade() {
    window.location.href = '/#pricing'
  }

  // Compute display values from local state for immediate feedback
  const displayUnitsUsed = localUnitsUsed
  const displayUnitsLimit = subscription?.units_limit ?? null
  const displayUnitsRemaining =
    displayUnitsLimit !== null ? Math.max(0, displayUnitsLimit - displayUnitsUsed) : null

  return (
    <div className="relative flex flex-col h-full py-6">
      {/* UsageBar - mounted under header, above messages */}
      {subscription?.plan && (
        <div className="mb-4">
          <UsageBar
            plan={subscription.plan}
            unitsUsed={displayUnitsUsed}
            unitsLimit={displayUnitsLimit}
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
        />
      </div>

      {/* Limit reached overlay */}
      {limitReached && (
        <LimitReachedOverlay
          planName={subscription?.plan ?? null}
          onUpgrade={handleUpgrade}
        />
      )}
    </div>
  )
}
