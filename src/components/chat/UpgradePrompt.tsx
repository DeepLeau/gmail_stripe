'use client'

import { useRouter } from 'next/navigation'
import { AlertTriangle, Lock } from 'lucide-react'

type UpgradePromptVariant = 'soft' | 'blocked'

interface UpgradePromptProps {
  variant: UpgradePromptVariant
  messagesUsed: number
  messagesLimit: number
  resetAt?: string | null
}

export function UpgradePrompt({ variant, messagesUsed, messagesLimit, resetAt }: UpgradePromptProps) {
  const router = useRouter()

  if (variant === 'soft') {
    return (
      <div
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
        style={{
          backgroundColor: 'rgba(251, 191, 36, 0.1)',
          border: '1px solid rgba(251, 191, 36, 0.25)',
        }}
      >
        <AlertTriangle size={15} strokeWidth={2} style={{ color: '#f59e0b', flexShrink: 0 }} />
        <p className="text-xs flex-1" style={{ color: 'var(--text-2)' }}>
          Tu as utilisé {messagesUsed}/{messagesLimit} questions ce mois.
          {resetAt && (
            <span className="ml-1" style={{ color: 'var(--text-3)' }}>
              Réinitialise le {new Date(resetAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}.
            </span>
          )}
        </p>
        <button
          onClick={() => router.push('/settings/billing')}
          className="text-xs font-medium flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors duration-150"
          style={{
            backgroundColor: '#f59e0b',
            color: '#fff',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.opacity = '0.85'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.opacity = '1'
          }}
        >
          Passer à Scale
        </button>
      </div>
    )
  }

  // variant === 'blocked'
  return (
    <div
      className="flex flex-col items-center gap-3 py-5 px-4 rounded-xl"
      style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
      }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
        }}
      >
        <Lock size={18} strokeWidth={1.5} style={{ color: 'var(--red)' }} />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
          Limite mensuelle atteinte
        </p>
        <p className="text-xs mb-3" style={{ color: 'var(--text-3)' }}>
          Tu as utilisé les {messagesLimit} questions incluses dans ton plan.
        </p>
        <button
          onClick={() => router.push('/settings/billing')}
          className="h-9 px-5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all duration-150"
          style={{
            backgroundColor: 'var(--accent)',
            color: '#fff',
            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.25)',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent-hi)'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent)'
          }}
        >
          Débloquer plus de questions
        </button>
      </div>
    </div>
  )
}
