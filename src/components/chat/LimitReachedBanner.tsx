'use client'

import Link from 'next/link'
import { AlertTriangle, X, Loader2 } from 'lucide-react'

interface LimitReachedBannerProps {
  visible: boolean
  planName: string
  messagesLimit: number
  onDismiss?: () => void
}

export function LimitReachedBanner({
  visible,
  planName,
  messagesLimit,
  onDismiss,
}: LimitReachedBannerProps) {
  if (!visible) return null

  return (
    <div
      className="shrink-0 mx-4 mb-3 flex items-start gap-3 p-3 rounded-xl border"
      style={{
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        borderColor: 'rgba(239, 68, 68, 0.25)',
      }}
      role="alert"
    >
      <AlertTriangle
        size={16}
        className="text-[var(--red)] shrink-0 mt-0.5"
        strokeWidth={2}
      />

      <div className="flex-1 min-w-0">
        <p
          className="text-xs font-medium mb-0.5"
          style={{ color: 'var(--red)' }}
        >
          Limite de messages atteinte
        </p>
        <p
          className="text-xs"
          style={{ color: 'var(--text-2)' }}
        >
          Tu as utilisé les {messagesLimit} messages inclus dans ton plan {planName}.{' '}
          <Link
            href="/pricing"
            className="font-medium underline underline-offset-2 hover:opacity-80 transition-opacity duration-150"
            style={{ color: 'var(--accent)' }}
          >
            Débloque plus de messages →
          </Link>
        </p>
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="shrink-0 w-6 h-6 flex items-center justify-center rounded-md
                     hover:bg-white/10 transition-colors duration-100
                     text-[var(--text-3)] hover:text-[var(--text-2)]"
          aria-label="Fermer"
        >
          <X size={13} strokeWidth={2} />
        </button>
      )}
    </div>
  )
}
