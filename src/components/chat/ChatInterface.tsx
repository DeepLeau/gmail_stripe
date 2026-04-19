'use client'

import { useState, useRef, useEffect, type FormEvent } from 'react'
import Link from 'next/link'
import type { ChatMessage } from '@/lib/chat/types'
import { sendMessage } from '@/lib/chat/mockApi'
import { ChatMessageBubble } from './ChatMessage'
import { TypingIndicator } from './TypingIndicator'
import { ChatInput } from './ChatInput'
import { AlertCircle } from 'lucide-react'

const PLAN_DISPLAY_NAMES: Record<string, string> = {
  start: 'Start',
  scale: 'Scale',
  team: 'Team',
}

type ChatInterfaceProps = {
  messagesLimit: number
  messagesUsed: number
  plan?: string
}

export function ChatInterface({
  messagesLimit,
  messagesUsed: initialMessagesUsed,
  plan = 'start',
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [quotaExceeded, setQuotaExceeded] = useState(false)
  const [messagesRemaining, setMessagesRemaining] = useState(
    Math.max(0, messagesLimit - initialMessagesUsed)
  )
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll automatique vers le bas après chaque message
  useEffect(() => {
    if (messages.length > 0) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      })
    }
  }, [messages.length])

  async function checkQuota(): Promise<boolean> {
    try {
      const res = await fetch('/api/billing/quota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'decrement' }),
      })

      if (!res.ok) {
        // Network error — fail open but log
        console.error('[ChatInterface] Quota check failed:', res.status)
        return true
      }

      const data = await res.json()
      setMessagesRemaining(data.messages_remaining ?? 0)

      if (!data.allowed) {
        setQuotaExceeded(true)
        return false
      }

      return true
    } catch (err) {
      console.error('[ChatInterface] Quota check error:', err)
      // Fail open on error — allow the message to be sent
      return true
    }
  }

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault()

    const trimmed = inputValue.trim()
    if (!trimmed || isLoading) return

    // Check quota before sending
    const allowed = await checkQuota()
    if (!allowed) return

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

  return (
    <div className="flex flex-col h-full py-6">
      {/* Zone des messages */}
      <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: 'var(--accent-light)' }}
            >
              <svg
                className="w-5 h-5"
                style={{ color: 'var(--accent)' }}
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
            <p
              className="text-sm font-medium mb-1"
              style={{ color: 'var(--text)' }}
            >
              Pose tes questions à tes emails
            </p>
            <p className="text-xs max-w-xs" style={{ color: 'var(--text-2)' }}>
              Dicte une question en langage naturel. L&apos;IA explore tes emails et te répond.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessageBubble key={msg.id} message={msg} />
        ))}

        {isLoading && <TypingIndicator />}

        {/* Quota exceeded banner */}
        {quotaExceeded && (
          <div
            className="flex items-start gap-3 px-4 py-3 rounded-lg mx-auto max-w-sm"
            style={{
              backgroundColor: 'var(--accent-glow)',
              border: '1px solid var(--accent)',
            }}
          >
            <AlertCircle
              size={15}
              className="mt-0.5 shrink-0"
              style={{ color: 'var(--accent)' }}
              strokeWidth={1.5}
            />
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--accent-hi)' }}>
                Limite atteinte
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--accent-hi)', opacity: 0.8 }}>
                Tu as utilisé les {messagesLimit} messages de ton plan{' '}
                {PLAN_DISPLAY_NAMES[plan] ?? plan}.{' '}
                <Link
                  href="/settings/billing"
                  className="underline font-medium"
                  style={{ color: 'var(--accent-hi)' }}
                >
                  Upgradé ton plan
                </Link>{' '}
                pour continuer.
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input fixe en bas */}
      <div className="shrink-0 pt-4">
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={() => handleSubmit()}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
