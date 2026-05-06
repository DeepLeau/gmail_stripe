'use client'

import { useState, useRef, useEffect, type FormEvent } from 'react'
import type { ChatMessage } from '@/lib/chat/types'
import type { SubscriptionData } from '@/lib/stripe/config'
import { sendChatMessage } from '@/lib/chat/mockApi'
import { ChatMessageBubble } from './ChatMessage'
import { TypingIndicator } from './TypingIndicator'
import { ChatInput } from './ChatInput'

interface ChatInterfaceProps {
  subscription?: SubscriptionData | null
}

export function ChatInterface({ subscription }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [limitReachedBanner, setLimitReachedBanner] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const remaining = subscription?.units_remaining ?? null
  const isLimitReached = remaining !== null && remaining <= 0

  // Scroll automatique vers le bas après chaque message
  useEffect(() => {
    if (messages.length > 0) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      })
    }
  }, [messages.length])

  // Effacer le message d'erreur quand l'utilisateur tape
  const handleInputChange = (value: string) => {
    setInputValue(value)
    if (errorMessage) setErrorMessage(null)
  }

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault()

    const trimmed = inputValue.trim()
    if (!trimmed || isLoading) return

    if (isLimitReached) {
      setLimitReachedBanner(true)
      return
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setLimitReachedBanner(false)
    setErrorMessage(null)

    setIsLoading(true)
    let response
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30_000)

      response = await sendChatMessage(trimmed)
      clearTimeout(timeoutId)

      if (response.limitReached) {
        setLimitReachedBanner(true)
        setIsLoading(false)
        return
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.text,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch {
      // Affichage discret sous le champ input — pas de modal, pas de toast
      setErrorMessage("Je n'ai pas pu générer de réponse. Réessaie.")
    } finally {
      setIsLoading(false)
    }
  }

  const showLimitBanner = limitReachedBanner || isLimitReached

  return (
    <div className="flex flex-col h-full py-6">
      {showLimitBanner && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-[var(--red)]/8 border border-[var(--red)]/20 text-sm text-[var(--red)] text-center">
          Tu as atteint ta limite de messages pour ce mois.{' '}
          <a href="/#pricing" className="underline font-medium hover:no-underline">
            Débloque plus de questions →
          </a>
        </div>
      )}

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

      <div className="shrink-0 pt-4">
        {/* Message d'erreur discret sous le champ input */}
        {errorMessage && (
          <p className="mb-2 text-xs text-[var(--text-2)] text-center">
            {errorMessage}
          </p>
        )}
        <ChatInput
          value={inputValue}
          onChange={handleInputChange}
          onSubmit={() => handleSubmit()}
          isLoading={isLoading}
          remaining={remaining}
        />
      </div>
    </div>
  )
}
