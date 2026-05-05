'use client'

import { useState, useRef, useEffect, type FormEvent } from 'react'
import type { ChatMessage } from '@/lib/chat/types'
import { sendChatMessage } from '@/lib/chat/mockApi'
import { ChatMessageBubble } from './ChatMessage'
import { TypingIndicator } from './TypingIndicator'
import { ChatInput } from './ChatInput'
import type { SubscriptionData } from '@/lib/stripe/config'
import { UNIT_LABEL } from '@/lib/stripe/config'
import { AlertCircle } from 'lucide-react'

interface ChatInterfaceProps {
  subscription: SubscriptionData | null
}

export function ChatInterface({ subscription }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [showLimitBanner, setShowLimitBanner] = useState(false)
  const [limitReached, setLimitReached] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const unitsUsed = subscription?.units_used ?? 0
  const unitsLimit = subscription?.units_limit ?? null
  const unitsRemaining = subscription?.units_remaining ?? null
  const isPaidPlan = subscription?.status === 'active' && unitsLimit !== null
  const planLabel = subscription?.plan
    ? subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)
    : null

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
    if (!trimmed || isLoading) return

    if (limitReached) {
      setShowLimitBanner(true)
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
    setShowLimitBanner(false)

    // Appel API
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
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (msg === 'limit_reached') {
        setLimitReached(true)
        setShowLimitBanner(true)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleLimitReached = () => {
    setLimitReached(true)
  }

  return (
    <div className="flex flex-col h-full py-6">
      {/* Header plan + quota */}
      {isPaidPlan && unitsRemaining !== null && (
        <div className="mb-4 flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
          <div className="flex items-center gap-2">
            {planLabel && (
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                style={{
                  backgroundColor: 'var(--accent-light)',
                  color: 'var(--accent)',
                }}
              >
                {planLabel}
              </span>
            )}
            <span className="text-xs text-[var(--text-2)]">
              {unitsRemaining} {UNIT_LABEL}{unitsRemaining !== 1 ? 's' : ''} restants
            </span>
          </div>
          {unitsRemaining <= 5 && unitsRemaining > 0 && (
            <span className="text-[10px] text-amber-600 font-medium">
              Plus que {unitsRemaining}
            </span>
          )}
        </div>
      )}

      {/* Bannière quota atteint */}
      {(limitReached || unitsRemaining === 0) && (
        <div className="mb-4 flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
          <AlertCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" strokeWidth={2} />
          <div className="min-w-0">
            <p className="text-sm font-medium text-amber-800">
              Limite de {UNIT_LABEL.toLowerCase()}s atteinte
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Mets à niveau ton plan pour continuer à poser des questions à tes emails.
            </p>
          </div>
        </div>
      )}

      {/* Bannière d'avertissement dismissible */}
      {showLimitBanner && !limitReached && unitsRemaining !== null && unitsRemaining > 0 && (
        <div className="mb-4 flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
          <AlertCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" strokeWidth={2} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-800">
              Plus que {unitsRemaining} {UNIT_LABEL.toLowerCase()}{unitsRemaining !== 1 ? 's' : ''} ce mois-ci
            </p>
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
            {/* Indicateur quota pour les plans payants */}
            {isPaidPlan && unitsRemaining !== null && (
              <p className="text-xs text-gray-400 mt-2">
                {unitsRemaining} {UNIT_LABEL.toLowerCase()}{unitsRemaining !== 1 ? 's' : ''} restants ce mois-ci
              </p>
            )}
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
          remaining={limitReached ? 0 : unitsRemaining}
          onLimitReached={handleLimitReached}
        />
      </div>
    </div>
  )
}
