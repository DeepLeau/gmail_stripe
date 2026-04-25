'use client'

import { useState, useRef, useEffect, type FormEvent } from 'react'
import type { ChatMessage } from '@/lib/chat/types'
import { sendMessage } from '@/lib/chat/mockApi'
import { ChatMessageBubble } from './ChatMessage'
import { TypingIndicator } from './TypingIndicator'
import { ChatInput } from './ChatInput'
import { PlanBadge } from './PlanBadge'
import { UpgradePrompt } from './UpgradePrompt'

interface SubscriptionInfo {
  planName: string
  messagesUsed: number
  messagesLimit: number
}

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const [isLimited, setIsLimited] = useState(false)
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch subscription info on mount
  useEffect(() => {
    async function fetchSubscription() {
      try {
        const response = await fetch('/api/user/subscription')
        if (response.ok) {
          const data = await response.json()
          setSubscription({
            planName: data.plan_name || 'Free',
            messagesUsed: data.messages_used || 0,
            messagesLimit: data.messages_limit || 100,
          })
          setIsLimited(data.is_limited || false)
        } else {
          // Default to Free plan
          setSubscription({
            planName: 'Free',
            messagesUsed: 0,
            messagesLimit: 100,
          })
          setIsLimited(false)
        }
      } catch {
        setSubscription({
          planName: 'Free',
          messagesUsed: 0,
          messagesLimit: 100,
        })
        setIsLimited(false)
      } finally {
        setIsLoadingSubscription(false)
      }
    }

    fetchSubscription()
  }, [])

  // Scroll automatique vers le bas après chaque message
  useEffect(() => {
    if (messages.length > 0) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      })
    }
  }, [messages.length])

  // Increment message count
  const incrementMessageCount = async () => {
    try {
      const response = await fetch('/api/messages/count', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'increment' }),
      })

      if (response.ok) {
        const data = await response.json()
        setSubscription((prev) =>
          prev
            ? {
                ...prev,
                messagesUsed: data.messages_used,
                messagesLimit: data.messages_limit,
              }
            : null
        )
        setIsLimited(data.is_limited || false)
      }
    } catch {
      // Silent fail
    }
  }

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault()

    const trimmed = inputValue.trim()
    if (!trimmed || isLoading || isLimited) return

    // Increment message count before sending
    await incrementMessageCount()

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
      {/* Plan badge */}
      <div className="shrink-0 mb-4 px-6">
        <PlanBadge
          planName={subscription?.planName || 'Free'}
          used={subscription?.messagesUsed || 0}
          limit={subscription?.messagesLimit || 100}
          isLoading={isLoadingSubscription}
        />
      </div>

      {/* Zone des messages */}
      <div className="flex-1 overflow-y-auto space-y-4 min-h-0 px-6">
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

      {/* Upgrade prompt */}
      {isLimited && <UpgradePrompt />}

      {/* Input fixe en bas */}
      <div className="shrink-0 pt-4 px-6">
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={() => handleSubmit()}
          isLoading={isLoading}
          disabled={isLimited}
        />
      </div>
    </div>
  )
}
