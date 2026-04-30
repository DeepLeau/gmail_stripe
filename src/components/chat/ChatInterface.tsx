'use client'

import { useState, useRef, useEffect } from 'react'
import type { ChatMessage } from '@/lib/chat/types'
import { sendMessage } from '@/lib/chat/mockApi'
import { ChatMessageBubble } from './ChatMessage'
import { TypingIndicator } from './TypingIndicator'
import { ChatInput } from './ChatInput'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface ChatInterfaceProps {
  userId?: string
  plan?: string | null
  remaining?: number | null
}

export function ChatInterface({ userId, plan, remaining: initialRemaining }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [remaining, setRemaining] = useState<number | null>(initialRemaining ?? null)
  const [showLimitBanner, setShowLimitBanner] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const isAtLimit = remaining !== null && remaining <= 0

  useEffect(() => {
    setShowLimitBanner(isAtLimit)
  }, [isAtLimit])

  // Scroll automatique vers le bas après chaque message
  useEffect(() => {
    if (messages.length > 0) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      })
    }
  }, [messages.length])

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()

    const trimmed = inputValue.trim()
    if (!trimmed || isLoading) return

    // Check quota via RPC before sending
    if (remaining !== null && remaining <= 0) {
      setShowLimitBanner(true)
      return
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInputValue('')

    // Decrement quota via RPC
    if (remaining !== null) {
      const supabase = createClient()
      if (supabase) {
        const { data: decResult } = await supabase.rpc('decrement_units')
        if (decResult) {
          const parsed = typeof decResult === 'string' ? JSON.parse(decResult) : decResult
          if (parsed && typeof parsed.remaining === 'number') {
            setRemaining(parsed.remaining)
            if (parsed.remaining <= 0) {
              setShowLimitBanner(true)
            }
          }
        }
      }
    }

    // Call API
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
      // Erreur silencieuse
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full py-6">
      {/* Banner: limit reached */}
      {showLimitBanner && (
        <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200">
          <p className="text-sm text-red-600 font-medium flex-1">
            Vous avez atteint votre limite — passez à un plan supérieur
          </p>
          <Link
            href="/#pricing"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline shrink-0"
          >
            Voir les plans
          </Link>
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
          onSubmit={handleSubmit}
          isLoading={isLoading}
          remaining={remaining}
          onLimitReached={() => setShowLimitBanner(true)}
        />
      </div>
    </div>
  )
}
