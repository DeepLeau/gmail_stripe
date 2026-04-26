'use client'

import { AlertCircle } from 'lucide-react'

export function LimitReachedBanner() {
  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-lg border border-[var(--red)]/20 bg-[var(--red)]/5">
      <AlertCircle
        size={15}
        strokeWidth={1.5}
        className="shrink-0 mt-0.5"
        style={{ color: 'var(--red)' }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: 'var(--red)' }}>
          Limite mensuelle atteinte
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>
          Vous avez consommé tous vos messages ce mois-ci.{' '}
          <a
            href="/pricing"
            className="font-medium underline underline-offset-2"
            style={{ color: 'var(--accent)' }}
          >
            Passer à un plan supérieur
          </a>{' '}
          pour continuer.
        </p>
      </div>
    </div>
  )
}
