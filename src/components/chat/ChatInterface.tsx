'use client'

import { useState, useRef, useEffect, type FormEvent } from 'react'
import Link from 'next/link'
import type { ChatMessage } from '@/lib/chat/types'
import type { SendMessageResponse } from '@/lib/chat/types'
import { sendMessage } from '@/lib/chat/mockApi'
import { ChatMessageBubble } from './ChatMessage'
import { TypingIndicator } from './TypingIndicator'
import { ChatInput } from './ChatInput'
import { UsageMeter } from '@/components/ui/UsageMeter'
import { PlanBadge } from '@/components/ui/PlanBadge'
import { motion, AnimatePresence } from 'framer-motion'

interface ChatInterfaceProps {
  initialUsed?: number
  initialLimit?: number
  planName?: string
}

export function ChatInterface({ initialUsed = 0, initialLimit = 5, planName = 'free' }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [limit_reached, setLimitReached] = useState(false)
  const [messagesUsed, setMessagesUsed] = useState(initialUsed)
  const [messagesLimit, setMessagesLimit] = useState(initialLimit)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll automatique vers le bas après chaque message
  useEffect(() => {
    if (messages.length > 0) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      })
    }
  }, [messages.length])

  // Sync props to state when they change
  useEffect(() => {
    setMessagesUsed(initialUsed)
    setMessagesLimit(initialLimit)
  }, [initialUsed, initialLimit])

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault()

    const trimmed = inputValue.trim()
    if (!trimmed || isLoading) return

    // Check if already over limit before sending
    if (limit_reached) return

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

      // Type guard: response peut être string (backward compat) ou SendMessageResponse (nouveau)
      if (typeof response === 'string') {
        // Pas de quota info disponible — backward compatible
        const aiMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'ai',
          content: response,
          timestamp: Date.now(),
        }
        setMessages((prev) => [...prev, aiMessage])
      } else {
        // SendMessageResponse avec info de quota
        const data = response as SendMessageResponse
        setMessagesUsed(data.messagesUsed)
        setMessagesLimit(data.messagesLimit)

        if (data.isOverLimit) {
          setLimitReached(true)
          // Add a system message about the limit
          const systemMessage: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'ai',
            content: "Vous avez atteint votre limite de messages pour ce mois. Passez à un plan supérieur pour continuer à poser des questions à vos emails.",
            timestamp: Date.now(),
          }
          setMessages((prev) => [...prev, systemMessage])
        } else {
          const aiMessage: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'ai',
            content: data.reply || '',
            timestamp: Date.now(),
          }
          setMessages((prev) => [...prev, aiMessage])
        }
      }
    } catch {
      // Erreur silencieuse — could add error state here
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full py-6">
      {/* Header avec UsageMeter et PlanBadge */}
      <div className="shrink-0 mb-4 flex items-center justify-between gap-4">
        <div className="flex-1 max-w-xs">
          <UsageMeter used={messagesUsed} limit={messagesLimit} />
        </div>
        <PlanBadge planName={planName} />
      </div>

      {/* Banner limite atteinte */}
      <AnimatePresence>
        {limit_reached && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="shrink-0 mb-4 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-amber-800 mb-0.5">
                  Limite de messages atteinte
                </p>
                <p className="text-xs text-amber-600">
                  Vous avez utilisé vos {messagesLimit} messages inclus dans votre plan.
                </p>
              </div>
              <Link
                href="/settings/billing"
                className="shrink-0 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-colors"
              >
                Passer à un plan supérieur
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
          disabled={limit_reached}
        />
      </div>
    </div>
  )
}
