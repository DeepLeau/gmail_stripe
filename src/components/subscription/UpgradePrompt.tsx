'use client'

import { useRouter } from 'next/navigation'
import { AlertTriangle } from 'lucide-react'

interface UpgradePromptProps {
  visible: boolean
}

export function UpgradePrompt({ visible }: UpgradePromptProps) {
  const router = useRouter()

  if (!visible) return null

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl border"
      style={{
        backgroundColor: 'rgba(245, 158, 11, 0.08)',
        borderColor: 'rgba(245, 158, 11, 0.25)',
      }}
      role="alert"
    >
      <AlertTriangle
        size={15}
        strokeWidth={1.5}
        className="shrink-0"
        style={{ color: 'var(--warning)' }}
      />
      <p className="text-sm flex-1" style={{ color: 'var(--text-2)' }}>
        Limite atteinte — upgrade vers plan supérieur
      </p>
      <button
        onClick={() => router.push('/pricing')}
        className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors duration-150"
        style={{
          backgroundColor: 'var(--accent)',
          color: '#fff',
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
            'var(--accent-hi)'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
            'var(--accent)'
        }}
      >
        Voir les plans
      </button>
    </div>
  )
}
