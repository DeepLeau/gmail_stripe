'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface UpgradePromptProps {
  message?: string
  variant?: 'banner' | 'inline'
}

export function UpgradePrompt({ message, variant = 'banner' }: UpgradePromptProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const bannerMessage = message ?? "Tu as atteint ta limite de messages pour ce mois."
  const inlineMessage = message ?? "Crée un compte pour accéder à Emind."

  if (variant === 'inline') {
    return (
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm"
        style={{
          backgroundColor: 'var(--accent-light)',
          borderColor: 'var(--accent)/20',
          color: 'var(--text)',
        }}
      >
        <span className="flex-1">{inlineMessage}</span>
        <button
          onClick={() => router.push('/signup')}
          disabled={loading}
          className="shrink-0 h-8 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors duration-150 disabled:opacity-50"
          style={{
            backgroundColor: 'var(--accent)',
            color: '#fff',
          }}
        >
          {loading ? (
            <span className="animate-spin w-3 h-3 border border-current border-t-transparent rounded-full" />
          ) : (
            'Commencer'
          )}
        </button>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col items-center gap-3 px-6 py-4 rounded-xl text-center"
      style={{
        backgroundColor: 'var(--accent-light)',
        border: '1px solid var(--accent)/20',
      }}
    >
      <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
        {bannerMessage}
      </p>
      <p className="text-xs" style={{ color: 'var(--text-2)' }}>
        Passe à un plan payant pour continuer à échanger avec l&apos;IA sur tes emails.
      </p>
      <button
        onClick={() => router.push('/pricing')}
        disabled={loading}
        className="h-8 px-4 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors duration-150 disabled:opacity-50"
        style={{
          backgroundColor: 'var(--accent)',
          color: '#fff',
        }}
      >
        {loading ? (
          <>
            <span className="animate-spin w-3 h-3 border border-current border-t-transparent rounded-full" />
            Redirection...
          </>
        ) : (
          'Voir les tarifs'
        )}
      </button>
    </div>
  )
}
