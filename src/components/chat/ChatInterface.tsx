'use client'

import { useState, useRef, useEffect, useCallback, type FormEvent } from 'react'
import type { ChatMessage } from '@/lib/chat/types'
import { sendMessage } from '@/lib/chat/mockApi'
import { ChatMessageBubble } from './ChatMessage'
import { TypingIndicator } from './TypingIndicator'
import { ChatInput } from './ChatInput'
import { createClient } from '@/lib/supabase/client'

interface SubscriptionData {
  units_used: number
  units_limit: number
  plan: string | null
}

type ChatStatus = 'loading_initial' | 'ready' | 'sending' | 'limit_reached'

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // ── Subscription state ──────────────────────────────────────────
  const [chatStatus, setChatStatus] = useState<ChatStatus>('loading_initial')
  const [unitsUsed, setUnitsUsed] = useState(0)
  const [unitsLimit, setUnitsLimit] = useState(0)

  const remaining = unitsLimit > 0 ? unitsLimit - unitsUsed : null
  const isAtLimit = remaining !== null && remaining <= 0

  // ── Load subscription on mount ─────────────────────────────────
  useEffect(() => {
    async function loadSubscription() {
      const supabase = createClient()
      if (!supabase) {
        setChatStatus('ready')
        return
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setChatStatus('ready')
        return
      }

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('units_used, units_limit, plan')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) {
        console.warn('[ChatInterface] Failed to load subscription:', error.message)
        setChatStatus('ready')
        return
      }

      if (data) {
        setUnitsUsed(data.units_used ?? 0)
        setUnitsLimit(data.units_limit ?? 0)
        if ((data.units_limit ?? 0) > 0 && (data.units_used ?? 0) >= (data.units_limit ?? 0)) {
          setChatStatus('limit_reached')
        } else {
          setChatStatus('ready')
        }
      } else {
        // No subscription row — free user
        setUnitsLimit(0)
        setUnitsUsed(0)
        setChatStatus('ready')
      }
    }

    void loadSubscription()
  }, [])

  // ── Scroll ───────────────────────────────────────────────────────
  useEffect(() => {
    if (messages.length > 0) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      })
    }
  }, [messages.length])

  // ── Decrement units ─────────────────────────────────────────────
  const decrementUnits = useCallback(async () => {
    const supabase = createClient()
    if (!supabase) return

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase.rpc('decrement_units')

    if (error) {
      console.warn('[ChatInterface] decrement_units error:', error.message)
      return
    }

    // data: { success: boolean, new_units_used: number }
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const result = data as { success: boolean; new_units_used?: number }
      if (result.success && result.new_units_used !== undefined) {
        setUnitsUsed(result.new_units_used)
        const newRemaining = unitsLimit - result.new_units_used
        if (newRemaining <= 0) {
          setChatStatus('limit_reached')
        }
      }
    }
  }, [unitsLimit])

  // ── Submit ──────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (e?: FormEvent) => {
      e?.preventDefault()

      const trimmed = inputValue.trim()
      if (!trimmed) return
      if (chatStatus === 'limit_reached') return
      if (chatStatus === 'sending' || chatStatus === 'loading_initial') return

      // Add user message
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: trimmed,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, userMessage])
      setInputValue('')

      // Decrement before API call so limit is enforced proactively
      setChatStatus('sending')
      await decrementUnits()

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
        // silently drop error
      } finally {
        setChatStatus(isAtLimit ? 'limit_reached' : 'ready')
      }
    },
    [inputValue, chatStatus, decrementUnits, isAtLimit]
  )

  return (
    <div className="flex flex-col h-full py-6">
      {/* Zone des messages */}
      <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
        {messages.length === 0 && chatStatus !== 'loading_initial' && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-10 h-10 rounded-full bg-[var(--surface-1)] flex items-center justify-center mb-4">
              <svg
                className="w-5 h-5 text-[var(--accent)]"
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
            <p className="text-sm font-medium text-[var(--text-1)] mb-1">
              Pose tes questions à tes emails
            </p>
            <p className="text-xs text-[var(--text-3)] max-w-xs">
              Dicte une question en langage naturel. L&apos;IA explore tes emails et te répond.
            </p>
          </div>
        )}

        {chatStatus === 'loading_initial' && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-6 h-6 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
            <p className="text-xs text-[var(--text-3)]">Chargement de votre abonnement…</p>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessageBubble key={msg.id} message={msg} />
        ))}

        {chatStatus === 'sending' && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Input fixe en bas */}
      <div className="shrink-0 pt-4">
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={() => handleSubmit()}
          isLoading={chatStatus === 'sending'}
          remaining={remaining}
          onLimitReached={() => setChatStatus('limit_reached')}
        />
      </div>
    </div>
  )
}
