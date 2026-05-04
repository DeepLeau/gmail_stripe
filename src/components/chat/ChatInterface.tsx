'use client'

import { useState, useRef, useEffect, type FormEvent } from 'react'
import type { ChatMessage } from '@/lib/chat/types'
import { sendMessage } from '@/lib/chat/mockApi'
import { ChatMessageBubble } from './ChatMessage'
import { TypingIndicator } from './TypingIndicator'
import { ChatInput } from './ChatInput'

interface SubscriptionStatus {
  plan: string | null
  units_remaining: number | null
  units_limit: number | null
  subscription_status: string
}

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null)
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch subscription status on mount
  useEffect(() => {
    async function loadSubscription() {
      try {
        const res = await fetch('/api/subscription/status', { cache: 'no-store' })
        if (res.ok) {
          const data: SubscriptionStatus = await res.json()
          setSubscription(data)
          // If the API returns units_remaining as a number, use it
          // If null, user is on free/unlimited plan
        } else if (res.status === 404) {
          // No subscription found — free tier
          setSubscription({
            plan: null,
            units_remaining: null,
            units_limit: null,
            subscription_status: 'free',
          })
        }
      } catch {
        // Network or parse error — treat as free tier, don't block UX
        setSubscription({
          plan: null,
          units_remaining: null,
          units_limit: null,
          subscription_status: 'free',
        })
      }
    }
    loadSubscription()
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

    // Check quota before sending — if remaining is explicitly 0, block
    if (subscription?.units_remaining === 0) {
      setShowUpgradeBanner(true)
      return
    }

    // Decrement quota via API (fire and forget — don't block UI)
    let newRemaining = subscription?.units_remaining ?? null
    if (subscription?.units_remaining !== null) {
      try {
        const res = await fetch('/api/subscription/use-unit', { method: 'POST', cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          newRemaining = data.units_remaining
          setSubscription(prev => prev ? { ...prev, units_remaining: newRemaining } : prev)
        } else if (res.status === 402) {
          setShowUpgradeBanner(true)
          setSubscription(prev => prev ? { ...prev, units_remaining: 0 } : prev)
          return
        }
      } catch {
        // Decrement failed — allow send, quota will re-sync on next page load
      }
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
      // Erreur silencieuse
    } finally {
      setIsLoading(false)
    }
  }

  const remaining = subscription?.units_remaining ?? null

  return (
    <div className="flex flex-col h-full py-6">
      {/* Banner — limite atteinte, mise à jour nécessaire */}
      {showUpgradeBanner && (
        <div className="mb-4 flex items-center justify-between gap-3 p-4 rounded-xl shrink-0"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--amber) 10%, transparent)',
            border: '1px solid color-mix(in srgb, var(--amber) 25%, transparent)',
          }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'color-mix(in srgb, var(--amber) 15%, transparent)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--amber)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--amber)' }}>
              Limite de messages atteinte
            </p>
          </div>
          <button
            onClick={() => window.location.href = '/#pricing'}
            className="text-xs font-medium px-3 py-1.5 rounded-lg shrink-0 transition-colors"
            style={{ backgroundColor: 'var(--amber)', color: '#fff' }}
          >
            Passer à un plan supérieur
          </button>
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
        />
      </div>
    </div>
  )
}