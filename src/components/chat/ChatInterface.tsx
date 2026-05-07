'use client'

import { useState, useRef, useEffect, type FormEvent } from 'react'
import type { ChatMessage } from '@/lib/chat/types'
import type { SubscriptionData } from '@/lib/stripe/config'
import { sendMessage } from '@/lib/chat/api'
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

    setIsLoading(true)
    try {
      // Historique : exclure les messages en attente (pending/loading),
      // mapper 'ai' → 'assistant' pour l'API
      const history = messages
        .filter((msg) => msg.role === 'user' || msg.role === 'ai')
        .map((msg) => ({
          role: (msg.role === 'ai' ? 'assistant' : msg.role) as 'user' | 'assistant',
          content: msg.content,
        }))

      const response = await sendMessage(trimmed, history)
      if (response.limitReached) {
        setLimitReachedBanner(true)
        return
      }
      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'ai',
        content: response.text,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, aiMessage])
    } catch {
      // Erreur silencieuse
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
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={() => handleSubmit()}
          isLoading={isLoading}
          remaining={remaining}
        />
      </div>
    </div>
  )
}
