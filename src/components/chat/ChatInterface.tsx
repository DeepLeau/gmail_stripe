'use client'

import { useState, useRef, useEffect, type FormEvent } from 'react'
import Link from 'next/link'
import type { ChatMessage } from '@/lib/chat/types'
import { sendMessage } from '@/lib/chat/mockApi'
import { ChatMessageBubble } from './ChatMessage'
import { TypingIndicator } from './TypingIndicator'
import { ChatInput } from './ChatInput'
import { Zap, AlertCircle } from 'lucide-react'

interface ChatInterfaceProps {
  hasSubscription: boolean
  messagesUsed: number
  messagesLimit: number
}

export function ChatInterface({
  hasSubscription,
  messagesUsed,
  messagesLimit,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const isLimited = hasSubscription && messagesUsed >= messagesLimit
  const remainingMessages = hasSubscription ? Math.max(0, messagesLimit - messagesUsed) : 0

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
    if (!trimmed || isLoading || isLimited) return

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
    <div className="flex flex-col h-full py-6">
      {/* Usage indicator */}
      {hasSubscription && (
        <div className="shrink-0 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Zap size={14} className={isLimited ? 'text-amber-500' : 'text-blue-500'} />
              <span className={`text-xs font-medium ${isLimited ? 'text-amber-600' : 'text-gray-600'}`}>
                {remainingMessages} / {messagesLimit} questions
              </span>
            </div>
            {isLimited && (
              <span className="text-xs text-amber-600">— Limite atteinte</span>
            )}
          </div>

          {/* Progress bar */}
          <div className="w-24 h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isLimited ? 'bg-amber-500' : 'bg-blue-500'
              }`}
              style={{
                width: `${Math.min(100, (messagesUsed / messagesLimit) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Zone des messages */}
      <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
        {messages.length === 0 && !isLimited && (
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

        {/* Limit reached message */}
        {isLimited && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mb-4">
              <AlertCircle size={24} className="text-amber-500" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-2">
              Limite de questions atteinte
            </p>
            <p className="text-xs text-gray-500 max-w-xs mb-6">
              Tu as utilisé toutes tes questions pour ce mois. Upgrade ton plan pour continuer.
            </p>
            <Link
              href="/#pricing"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              <Zap size={14} />
              <span>Voir les plans</span>
            </Link>
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
        {isLimited ? (
          <div className="h-12 rounded-xl bg-gray-100 flex items-center justify-center">
            <p className="text-xs text-gray-500">
              <Link href="/#pricing" className="text-blue-500 hover:underline font-medium">
                Upgrade ton plan
              </Link>{' '}
              pour continuer à poser des questions
            </p>
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
