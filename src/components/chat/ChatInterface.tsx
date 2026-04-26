'use client'

import { useState, useRef, useEffect, type FormEvent } from 'react'
import type { ChatMessage } from '@/lib/chat/types'
import { sendMessage } from '@/lib/chat/mockApi'
import { ChatMessageBubble } from './ChatMessage'
import { TypingIndicator } from './TypingIndicator'
import { ChatInput } from './ChatInput'
import { AlertCircle } from 'lucide-react'

interface ChatInterfaceProps {
  plan?: string
  messages_limit?: number | null
  messages_used?: number
  messages_remaining?: number | null
  status?: string
}

export function ChatInterface({
  messages_limit: _messages_limit,
  messages_used: _messages_used,
  messages_remaining: messagesRemaining,
  status: _status,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [localLoading, setLocalLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Subtle loading skeleton
  useEffect(() => {
    const timer = setTimeout(() => setLocalLoading(false), 400)
    return () => clearTimeout(timer)
  }, [])

  // Scroll automatique vers le bas après chaque message
  useEffect(() => {
    if (messages.length > 0) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      })
    }
  }, [messages.length])

  const isLimitReached = messagesRemaining === 0

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
        content: typeof response === 'string' ? response : '',
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, aiMessage])
    } catch {
      // Erreur silencieuse
    } finally {
      setIsLoading(false)
    }
  }

  if (localLoading) {
    return (
      <div className="flex flex-col h-full py-6">
        <div className="flex-1 space-y-4 min-h-0">
          <div className="h-16 rounded-xl bg-gray-100 animate-pulse" />
          <div className="h-16 rounded-xl bg-gray-100 animate-pulse" />
          <div className="h-16 rounded-xl bg-gray-100 animate-pulse w-3/4" />
        </div>
        <div className="shrink-0 pt-4">
          <div className="h-12 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full py-6">
      {/* Bannière limite atteinte */}
      {isLimitReached && (
        <div className="mb-4 flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
          <AlertCircle size={16} className="text-amber-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-amber-800">
              Limite de messages atteinte
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Renouvellement le mois prochain
            </p>
          </div>
          <a
            href="/#pricing"
            className="shrink-0 text-xs font-medium text-amber-700 hover:text-amber-800 underline underline-offset-2"
          >
            Changer de plan
          </a>
        </div>
      )}

      {/* Zone des messages */}
      <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
        {messages.length === 0 && !isLimitReached && (
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
