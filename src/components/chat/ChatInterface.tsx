'use client'

import { useState, useRef, useEffect, type FormEvent } from 'react'
import type { ChatMessage } from '@/lib/chat/types'
import { sendMessage } from '@/lib/chat/mockApi'
import { ChatMessageBubble } from './ChatMessage'
import { TypingIndicator } from './TypingIndicator'
import { ChatInput } from './ChatInput'

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Quota / subscription states
  const [loadingQuota, setLoadingQuota] = useState(true)
  const [subscriptionData, setSubscriptionData] = useState<{
    plan: string | null
    units_used: number
    units_limit: number | null
    units_remaining: number | null
    status: string
  } | null>(null)
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(false)

  // Fetch subscription status on mount
  useEffect(() => {
    async function fetchQuota() {
      try {
        const res = await fetch('/api/subscriptions/remaining', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          setSubscriptionData(data)
        }
      } catch {
        // Silently fail — quota state remains at default (unlimited)
      } finally {
        setLoadingQuota(false)
      }
    }
    fetchQuota()
  }, [])

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

      // Increment quota after successful AI response
      try {
        const incrementRes = await fetch('/api/subscriptions/increment', { method: 'POST' })
        if (incrementRes.status === 429) {
          setShowUpgradeBanner(true)
        } else if (incrementRes.ok) {
          const updated = await incrementRes.json()
          setSubscriptionData(updated)
          if (updated.units_remaining !== null && updated.units_remaining <= 0) {
            setShowUpgradeBanner(true)
          }
        }
      } catch {
        // Increment failure — non-critical, continue normally
      }
    } catch {
      // Erreur silencieuse — could add error state here
    } finally {
      setIsLoading(false)
    }
  }

  const remaining = subscriptionData?.units_remaining ?? null

  return (
    <div className="flex flex-col h-full py-6">
      {/* Zone des messages */}
      <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
        {loadingQuota && (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
              <p className="text-xs text-gray-400">Chargement...</p>
            </div>
          </div>
        )}

        {!loadingQuota && messages.length === 0 && (
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

      {/* Bannière limite atteinte */}
      {showUpgradeBanner && (
        <div className="shrink-0 mb-3 mx-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200">
          <p className="text-xs text-red-600 font-medium">
            Limite de messages atteinte
          </p>
          <a
            href="/#pricing"
            className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline shrink-0"
          >
            Voir les plans
          </a>
        </div>
      )}

      {/* Input fixe en bas */}
      <div className="shrink-0 pt-4">
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={() => handleSubmit()}
          isLoading={isLoading}
          remaining={remaining}
          onLimitReached={() => setShowUpgradeBanner(true)}
        />
      </div>
    </div>
  )
}
