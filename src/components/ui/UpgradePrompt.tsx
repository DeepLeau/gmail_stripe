'use client'

import { AlertTriangle } from 'lucide-react'

type UpgradePromptProps = {
  planName?: string
  upgradeUrl?: string
}

export function UpgradePrompt({
  planName = 'Start',
  upgradeUrl = '/#pricing',
}: UpgradePromptProps) {
  return (
    <div
      className="flex items-start gap-3 px-4 py-3 rounded-lg mb-3"
      style={{
        backgroundColor: 'var(--accent)',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(99,102,241,0.04) 100%)',
        border: '1px solid rgba(99,102,241,0.2)',
      }}
    >
      <AlertTriangle
        size={16}
        strokeWidth={1.5}
        className="mt-0.5 flex-shrink-0"
        style={{ color: 'var(--accent-hi)' }}
      />
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium mb-0.5"
          style={{ color: 'var(--text-1)' }}
        >
          Quota de messages atteint
        </p>
        <p
          className="text-xs"
          style={{ color: 'var(--text-2)', lineHeight: 1.5 }}
        >
          Tu as utilisé tous tes messages du mois sur le plan {planName}.
          Passe à un plan supérieur pour continuer à utiliser Emind.
        </p>
      </div>
      <a
        href={upgradeUrl}
        className="shrink-0 h-7 px-3 flex items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-colors duration-150 whitespace-nowrap"
        style={{
          backgroundColor: 'var(--accent)',
          color: '#fff',
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLAnchorElement).style.backgroundColor =
            'var(--accent-hi)'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLAnchorElement).style.backgroundColor =
            'var(--accent)'
        }}
      >
        Voir les plans
      </a>
    </div>
  )
}
