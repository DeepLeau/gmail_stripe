'use client'

import { useState, useRef, useEffect, useCallback, type FormEvent } from 'react'
import type { ChatMessage } from '@/lib/chat/types'
import { ChatMessageBubble } from './ChatMessage'
import { TypingIndicator } from './TypingIndicator'
import { ChatInput } from './ChatInput'
import { UpgradePrompt } from '@/components/ui/UpgradePrompt'

type ChatInterfaceProps = {
  /** Plan name passé depuis le serveur pour le CTA upgrade si quota atteint */
  planName?: string
}

type SendResult =
  | { ok: true; response: string; quota_remaining: number; quota_exceeded: boolean }
  | { ok: false; error: string }

export function ChatInterface({ planName = 'Start' }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [quotaExceeded, setQuotaExceeded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll automatique vers le bas après chaque message
  useEffect(() => {
    if (messages.length > 0) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      })
    }
  }, [messages.length])

  const handleSend = useCallback(async (): Promise<SendResult> => {
    const trimmed = inputValue.trim()
    if (!trimmed || isLoading) {
      return { ok: false, error: 'no_content' }
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: trimmed }),
      })

      // 403 = quota exceeded — message affiché mais comptabilisé
      if (res.status === 403) {
        const data = await res.json().catch(() => ({}))
        if (data.error === 'quota_exceeded') {
          setQuotaExceeded(true)
          const aiMessage: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'ai',
            content:
              "Tu as atteint ton quota de messages pour ce mois. Passe à un plan supérieur pour continuer à discuter.",
            timestamp: Date.now(),
          }
          setMessages((prev) => [...prev, aiMessage])
          return {
            ok: true,
            response: aiMessage.content,
            quota_remaining: 0,
            quota_exceeded: true,
          }
        }
      }

      if (!res.ok) {
        throw new Error('server_error')
      }

      const data = await res.json()

      // Vérifie si le quota est dépassé même en succès (cas limite)
      if (data.quota_exceeded) {
        setQuotaExceeded(true)
      }

      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'ai',
        content: data.response,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, aiMessage])
      return {
        ok: true,
        response: data.response,
        quota_remaining: data.quota_remaining,
        quota_exceeded: data.quota_exceeded ?? false,
      }
    } catch {
      return { ok: false, error: 'network_error' }
    } finally {
      setIsLoading(false)
    }
  }, [inputValue, isLoading])

  const handleSubmit = useCallback(async (e?: FormEvent) => {
    e?.preventDefault()
    if (quotaExceeded) return
    await handleSend()
  }, [quotaExceeded, handleSend])

  return (
    <div className="flex flex-col h-full py-6">
      {/* Zone des messages */}
      <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-10 h-10 rounded-full bg-[var(--surface-2)] flex items-center justify-center mb-4">
              <svg
                className="w-5 h-5 text-[var(--text-3)]"
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

        {messages.map((msg) => (
          <ChatMessageBubble key={msg.id} message={msg} />
        ))}

        {isLoading && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Zone fixe en bas */}
      <div className="shrink-0 pt-4">
        {/* Upgrade prompt — affiché quand le quota est épuisé */}
        {quotaExceeded && <UpgradePrompt planName={planName} />}

        {/* Input — disabled visuellement quand quota atteint */}
        <div className={quotaExceeded ? 'opacity-60 pointer-events-none' : ''}>
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSubmit={() => handleSubmit()}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}
