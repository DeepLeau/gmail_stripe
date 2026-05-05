'use client'

import { useState, useRef, useEffect, type FormEvent } from 'react'
import type { ChatMessage } from '@/lib/chat/types'
import { sendMessage } from '@/lib/chat/mockApi'
import { ChatMessageBubble } from './ChatMessage'
import { TypingIndicator } from './TypingIndicator'
import { ChatInput } from './ChatInput'
import type { SubscriptionData } from '@/lib/stripe/config'
import { UNIT_LABEL, UNIT_LABEL_PLURAL } from '@/lib/stripe/config'
import { decrementUnits } from '@/app/actions/subscription'
import { Loader2 } from 'lucide-react'

interface ChatInterfaceProps {
  subscription: SubscriptionData | null
}

export function ChatInterface({ subscription }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [quotaError, setQuotaError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const unitsRemaining = subscription?.units_remaining ?? null
  const unitsLimit = subscription?.units_limit ?? null
  const isLimitReached = unitsRemaining === 0

  const unitLabel = unitsRemaining === 1 ? UNIT_LABEL : UNIT_LABEL_PLURAL

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

    // Bloquer si quota épuisé
    if (isLimitReached) {
      setQuotaError(`Tu as utilisé tous tes ${unitLabel.toLowerCase()}. Passe à un plan supérieur pour continuer.`)
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
    setQuotaError(null)

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

      // Décrémenter le quota après une réponse réussie
      await decrementUnits()
    } catch {
      // Erreur silencieuse — could add error state here
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full py-6">
      {/* Bannière quota limité */}
      {isLimitReached && (
        <div className="mb-4 flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[var(--red)]/8 border border-[var(--red)]/20 text-sm text-[var(--red)]">
          <span className="flex-1">
            Tu as utilisé tous tes {unitLabel.toLowerCase()}. Passe à un plan supérieur pour continuer.
          </span>
          <a
            href="/#pricing"
            className="shrink-0 px-3 py-1.5 rounded-lg bg-[var(--red)] text-white text-xs font-medium hover:bg-[var(--red)]/80 transition-colors"
          >
            Voir les plans
          </a>
        </div>
      )}

      {/* Zone des messages */}
      <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
        {messages.length === 0 && !quotaError && (
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

        {messages.length === 0 && quotaError && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-10 h-10 rounded-full bg-[var(--red)]/8 flex items-center justify-center mb-4">
              <Loader2 size={20} className="text-[var(--red)]" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">
              Quota épuisé
            </p>
            <p className="text-xs text-gray-500 max-w-xs">
              {quotaError}
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
          remaining={unitsRemaining}
        />
      </div>
    </div>
  )
}
