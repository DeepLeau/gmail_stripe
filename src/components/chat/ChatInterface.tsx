'use client'

import { useState, useRef, useEffect, type FormEvent } from 'react'
import type { ChatMessage } from '@/lib/chat/types'
import { sendMessage } from '@/lib/chat/mockApi'
import { createClient } from '@/lib/supabase/client'
import { ChatMessageBubble } from './ChatMessage'
import { TypingIndicator } from './TypingIndicator'
import { ChatInput } from './ChatInput'

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [planName, setPlanName] = useState<string | null>(null)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [quotaLoading, setQuotaLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch subscription quota on mount
  useEffect(() => {
    async function fetchQuota() {
      const supabase = createClient()

      if (!supabase) {
        setQuotaLoading(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setQuotaLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('plan, units_used, units_limit')
        .eq('user_id', user.id)
        .single()

      if (!error && data) {
        const planMap: Record<string, string> = {
          starter: 'Starter',
          growth: 'Growth',
          pro: 'Pro',
        }
        setPlanName(planMap[data.plan] || data.plan || 'Free')
        if (data.units_limit !== null) {
          setRemaining(Math.max(0, data.units_limit - data.units_used))
        }
      } else {
        setPlanName('Free')
        setRemaining(null)
      }

      setQuotaLoading(false)
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

    // Appel API (qui vérifie le quota et décrémente)
    setIsLoading(true)
    try {
      const result = await sendMessage(trimmed)
      if ('limitReached' in result && result.limitReached) {
        // Met à jour l'état local pour refléter la limite atteinte
        setRemaining(0)
        return
      }
      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'ai',
        content: 'text' in result ? result.text : '',
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, aiMessage])
      // Décrémente localement le compteur
      if (remaining !== null && remaining > 0) {
        setRemaining((r) => (r !== null ? r - 1 : null))
      }
    } catch {
      // Erreur silencieuse — could add error state here
    } finally {
      setIsLoading(false)
    }
  }

  const planBadge =
    planName && remaining !== null
      ? `${planName} · ${remaining} message${remaining !== 1 ? 's' : ''} restant${remaining !== 1 ? 's' : ''}`
      : planName || null

  return (
    <div className="flex flex-col h-full py-6">
      {/* Header avec badge plan */}
      {planBadge && !quotaLoading && (
        <div className="shrink-0 mb-4 px-6">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: 'var(--accent-light)',
              color: 'var(--accent)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: 'var(--accent)' }}
            />
            {planBadge}
          </span>
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
