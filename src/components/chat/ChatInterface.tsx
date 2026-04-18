'use client'

import { useState, useRef, useEffect, type FormEvent } from 'react'
import type { ChatMessage } from '@/lib/chat/types'
import { sendMessage } from '@/lib/chat/mockApi'
import { ChatMessageBubble } from './ChatMessage'
import { TypingIndicator } from './TypingIndicator'
import { ChatInput } from './ChatInput'
import { UsageMeter } from '@/components/ui/UsageMeter'

type QuotaState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; plan: string; messagesUsed: number; messagesLimit: number; renewalDate: string }
  | { status: 'limitReached' }

interface QuotaData {
  plan: string
  messagesUsed: number
  messagesLimit: number
  renewalDate: string
}

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [quotaState, setQuotaState] = useState<QuotaState>({ status: 'loading' })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll automatique vers le bas après chaque message
  useEffect(() => {
    if (messages.length > 0) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      })
    }
  }, [messages.length])

  // Charger le quota au mount
  useEffect(() => {
    const loadQuota = async () => {
      try {
        const res = await fetch('/api/profile/messages')
        if (res.status === 401) {
          // Not authenticated — redirect handled by middleware
          return
        }
        if (!res.ok) {
          setQuotaState({ status: 'error' })
          return
        }
        const data: QuotaData = await res.json()
        setQuotaState({
          status: 'ready',
          plan: data.plan,
          messagesUsed: data.messagesUsed,
          messagesLimit: data.messagesLimit,
          renewalDate: data.renewalDate,
        })
      } catch {
        setQuotaState({ status: 'error' })
      }
    }

    loadQuota()
  }, [])

  const isLimitReached = quotaState.status === 'limitReached'
  const isReady = quotaState.status === 'ready'
  const quotaData: QuotaData | null =
    quotaState.status === 'ready' ? quotaState : null

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault()

    const trimmed = inputValue.trim()
    if (!trimmed || isLoading) return

    // Vérifier le quota avant d'envoyer (seulement si on a des données quota)
    if (quotaState.status === 'ready') {
      try {
        const res = await fetch('/api/profile/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ decrement: 1 }),
        })

        if (res.status === 429) {
          setQuotaState({ status: 'limitReached' })
          return
        }

        if (res.ok) {
          const data = await res.json()
          setQuotaState({
            status: 'ready',
            plan: quotaState.plan,
            messagesUsed: data.messagesUsed,
            messagesLimit: data.messagesLimit,
            renewalDate: quotaState.renewalDate,
          })
        }
      } catch {
        // Continue even if quota check fails — don't block the user
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
      // Erreur silencieuse — could add error state here
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full py-6 gap-4">
      {/* Quota meter */}
      <div className="shrink-0">
        {quotaState.status === 'loading' && (
          <UsageMeter
            plan=""
            messagesUsed={0}
            messagesLimit={0}
            renewalDate=""
            isLoading={true}
          />
        )}
        {quotaState.status === 'error' && (
          <div className="text-xs text-center px-3 py-2 rounded-lg" style={{ color: 'var(--text-3)', backgroundColor: 'var(--surface)' }}>
            Chargement du quota indisponible
          </div>
        )}
        {quotaData && (
          <UsageMeter
            plan={quotaData.plan}
            messagesUsed={quotaData.messagesUsed}
            messagesLimit={quotaData.messagesLimit}
            renewalDate={quotaData.renewalDate}
            isLoading={false}
          />
        )}
      </div>

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
      <div className="shrink-0 pt-2">
        {isLimitReached ? (
          <div className="flex flex-col gap-2">
            <div className="px-4 py-3 rounded-xl text-center text-sm" style={{ backgroundColor: 'var(--surface)', color: 'var(--text-3)', border: '1px solid var(--border)' }}>
              Limite atteinte — Upgrade pour continuer
            </div>
            <a
              href="/#pricing"
              className="h-11 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors duration-150"
              style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
            >
              Upgrader mon plan
            </a>
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
