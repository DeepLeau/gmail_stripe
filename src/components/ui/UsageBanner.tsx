'use client'

import { useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'

interface UsageBannerProps {
  quotaUsed: number
  quotaLimit: number
}

export function UsageBanner({ quotaUsed, quotaLimit }: UsageBannerProps) {
  const [dismissed, setDismissed] = useState(false)
  const [loading, setLoading] = useState(false)

  if (dismissed) return null

  return (
    <div
      className="flex items-start gap-3 px-4 py-3.5 rounded-xl mb-4"
      style={{
        backgroundColor: 'rgba(248, 113, 113, 0.08)',
        border: '1px solid rgba(248, 113, 113, 0.20)',
      }}
    >
      <AlertTriangle
        size={16}
        className="mt-0.5 shrink-0"
        style={{ color: 'var(--red)' }}
        strokeWidth={1.5}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: 'var(--red)' }}>
          Quota de messages épuisé
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--red)', opacity: 0.7 }}>
          Tu as utilisé {quotaUsed}/{quotaLimit} messages ce mois. Passe à un plan
          supérieur pour continuer.
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <a
          href="/#pricing"
          className="h-7 px-3 flex items-center justify-center gap-1.5 rounded-md text-xs font-medium
                     transition-colors duration-150"
          style={{
            backgroundColor: 'var(--red)',
            color: '#fff',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLAnchorElement).style.opacity = '0.85'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLAnchorElement).style.opacity = '1'
          }}
        >
          {loading ? (
            <>
              <Loader2 size={11} className="animate-spin shrink-0" />
              <span>Chargement...</span>
            </>
          ) : (
            <span>Mettre à niveau</span>
          )}
        </a>
        <button
          onClick={() => setDismissed(true)}
          className="w-6 h-6 flex items-center justify-center rounded-md text-xs
                     transition-colors duration-150"
          style={{
            color: 'var(--red)',
            opacity: 0.6,
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget).style.opacity = '1'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget).style.opacity = '0.6'
          }}
          aria-label="Fermer"
        >
          ×
        </button>
      </div>
    </div>
  )
}
