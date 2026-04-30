'use client'

import { useState, useRef, useEffect, type FormEvent } from 'react'
import type { ChatMessage } from '@/lib/chat/types'
import { sendMessage } from '@/lib/chat/mockApi'
import { decrementUnits } from '@/app/actions/subscription'
import { ChatMessageBubble } from './ChatMessage'
import { TypingIndicator } from './TypingIndicator'
import { ChatInput } from './ChatInput'

interface ChatInterfaceProps {
  plan: string | null
  remaining: number
  limit: number
}

export function ChatInterface({ plan, remaining: initialRemaining, limit }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [remaining, setRemaining] = useState(initialRemaining)
  const [limitReached, setLimitReached] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
    if (!trimmed || isLoading || limitReached) return

    // Ajout du message utilisateur
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInputValue('')

    // Appel API + quota decrement
    setIsLoading(true)
    try {
      // Try to decrement quota first — if limit_reached, block the request
      const quotaResult = await decrementUnits()

      if (quotaResult.error === 'limit_reached') {
        // Add a system message notifying the user
        const systemMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'ai',
          content: 'Vous avez atteint votre limite de messages pour ce mois.',
          timestamp: Date.now(),
        }
        setMessages((prev) => [...prev, systemMsg])
        setLimitReached(true)
        setRemaining(0)
        setIsLoading(false)
        return
      }

      // Update remaining after successful decrement
      if (quotaResult.remaining !== undefined && quotaResult.remaining !== null) {
        setRemaining(quotaResult.remaining)
        if (quotaResult.remaining === 0) setLimitReached(true)
      }

      // Call the mock API to get AI response
      const response = await sendMessage(trimmed)
      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'ai',
        content: response,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, aiMessage])
    } catch {
      // Erreur silencieuse
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full py-6">
      {/* Limit reached warning banner */}
      {limitReached && (
        <div className="mb-4 px-4 py-3 rounded-lg border text-sm flex items-center justify-between gap-3"
          style={{
            backgroundColor: 'var(--orange-light, #fff7ed)',
            borderColor: 'var(--orange-border, #fdba74)',
            color: 'var(--orange-text, #c2410c)',
          }}>
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
              <path d="M8 1.5L14.5 13H1.5L8 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
              <path d="M8 6v3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              <circle cx="8" cy="10.5" r="0.6" fill="currentColor"/>
            </svg>
            <span>Limite de messages atteinte pour ce mois.</span>
          </div>
          <a
            href="/#pricing"
            className="text-xs font-semibold underline underline-offset-2 shrink-0"
            style={{ color: 'inherit' }}
          >
            Passer à un plan supérieur →
          </a>
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
          remaining={remaining}
          onLimitReached={() => setLimitReached(true)}
        />
      </div>
    </div>
  )
}
