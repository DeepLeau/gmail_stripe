'use client'

import { useState, useRef, useEffect } from 'react'
import type { ChatMessage } from '@/lib/chat/types'
import { sendMessage } from '@/lib/chat/mockApi'
import { ChatMessageBubble } from './ChatMessage'
import { TypingIndicator } from './TypingIndicator'
import { ChatInput } from './ChatInput'
import { createClient } from '@/lib/supabase/client'

interface SubscriptionData {
  plan: string | null
  units_used: number
  units_limit: number | null
  units_remaining: number | null
  status: string
}

function getProgressColor(percentage: number): string {
  if (percentage >= 90) return 'var(--red)'
  if (percentage >= 75) return 'var(--yellow)'
  return 'var(--green)'
}

function getProgressBg(percentage: number): string {
  if (percentage >= 90) return 'rgba(239, 68, 68, 0.12)'
  if (percentage >= 75) return 'rgba(234, 179, 8, 0.12)'
  return 'rgba(34, 197, 94, 0.12)'
}

const PLAN_DISPLAY_NAMES: Record<string, string> = {
  start: 'Start',
  scale: 'Scale',
  team: 'Team',
}

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch subscription on mount
  useEffect(() => {
    async function fetchSubscription() {
      const supabase = createClient()
      if (!supabase) return

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('plan, units_used, units_limit, subscription_status')
        .eq('user_id', user.id)
        .single()

      if (error || !data) {
        // No subscription — silent, don't show banner
        return
      }

      const units_limit = data.units_limit ?? null
      const units_used = data.units_used ?? 0
      const units_remaining = units_limit !== null ? Math.max(0, units_limit - units_used) : null

      setSubscription({
        plan: data.plan ?? null,
        units_used,
        units_limit,
        units_remaining,
        status: data.subscription_status ?? 'free',
      })
      setShowBanner(true)
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

  const remaining = subscription?.units_remaining ?? null
  const isLimitReached = remaining === 0

  const handleSubmit = async () => {
    const trimmed = inputValue.trim()
    if (!trimmed || isLoading) return

    if (isLimitReached) return

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

      // Refresh subscription state after message (units_used may have increased)
      if (subscription) {
        setSubscription((prev) =>
          prev
            ? {
                ...prev,
                units_used: prev.units_used + 1,
                units_remaining:
                  prev.units_limit !== null
                    ? Math.max(0, prev.units_limit - prev.units_used - 1)
                    : null,
              }
            : null
        )
      }
    } catch {
      // Erreur silencieuse — could add error state here
    } finally {
      setIsLoading(false)
    }
  }

  const percentage =
    subscription?.units_limit && subscription.units_limit > 0
      ? (subscription.units_used / subscription.units_limit) * 100
      : 0

  const progressColor = getProgressColor(percentage)
  const progressBg = getProgressBg(percentage)

  const planLabel =
    subscription?.plan
      ? PLAN_DISPLAY_NAMES[subscription.plan] ?? subscription.plan
      : null

  return (
    <div className="flex flex-col h-full py-6">
      {/* Subscription quota banner */}
      {showBanner && planLabel && remaining !== null && (
        <div
          className="shrink-0 mb-4 px-4 py-3 rounded-xl flex items-center gap-4"
          style={{
            backgroundColor: progressBg,
            border: `1px solid ${progressColor}22`,
          }}
        >
          {/* Plan label */}
          <div className="flex flex-col gap-0.5 min-w-0">
            <p
              className="text-xs font-semibold tracking-wide uppercase"
              style={{ color: progressColor }}
            >
              Plan {planLabel}
            </p>
            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
              {remaining}{' '}
              <span style={{ color: 'var(--text-2)' }}>messages restants</span>
            </p>
          </div>

          {/* Progress bar */}
          <div className="flex-1 min-w-0">
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ backgroundColor: 'var(--border)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(percentage, 100)}%`,
                  backgroundColor: progressColor,
                }}
              />
            </div>
          </div>

          {/* Limit reached warning */}
          {isLimitReached && (
            <p className="text-xs font-medium shrink-0" style={{ color: progressColor }}>
              Limite atteinte
            </p>
          )}
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
          onLimitReached={() => {}}
        />
      </div>
    </div>
  )
}
