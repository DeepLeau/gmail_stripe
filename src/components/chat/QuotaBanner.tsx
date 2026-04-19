'use client'

import { useEffect, useState } from 'react'
import { Zap, AlertTriangle } from 'lucide-react'

export interface QuotaBannerProps {
  plan: string
  messagesLimit: number
  messagesRemaining: number
  onUpgrade?: () => void
}

export function QuotaBanner({
  plan,
  messagesLimit,
  messagesRemaining,
  onUpgrade,
}: QuotaBannerProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const usagePercent = Math.min((1 - messagesRemaining / messagesLimit) * 100, 100)
  const isWarning = usagePercent >= 75
  const isCritical = usagePercent >= 90
  const isExceeded = messagesRemaining <= 0

  if (isExceeded) {
    return (
      <div
        className="flex items-center justify-between gap-4 px-4 py-3 rounded-lg"
        style={{
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
        }}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
            }}
          >
            <AlertTriangle size={15} className="text-[var(--red)]" strokeWidth={1.5} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[var(--red)]">
              Limite de messages atteinte
            </p>
            <p className="text-xs text-[var(--text-3)]">
              Votre quota {plan} est épuisé pour ce mois
            </p>
          </div>
        </div>
        <button
          onClick={onUpgrade}
          className="h-8 px-4 flex items-center justify-center gap-1.5 rounded-lg text-xs font-medium transition-colors duration-150 whitespace-nowrap shrink-0"
          style={{
            backgroundColor: 'var(--red)',
            color: '#fff',
          }}
        >
          <Zap size={12} strokeWidth={1.5} />
          <span>Upgrade</span>
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider"
            style={{
              backgroundColor: 'var(--accent-light)',
              color: 'var(--accent)',
            }}
          >
            {plan}
          </span>
          <span className="text-xs text-[var(--text-3)]">
            {messagesRemaining} message{messagesRemaining !== 1 ? 's' : ''} restant{messagesRemaining !== 1 ? 's' : ''}
          </span>
        </div>
        {isCritical && (
          <span
            className="text-[11px] font-medium flex items-center gap-1"
            style={{ color: 'var(--red)' }}
          >
            <AlertTriangle size={11} strokeWidth={1.5} />
            Quota presque épuisé
          </span>
        )}
        {isWarning && !isCritical && (
          <span
            className="text-[11px] font-medium"
            style={{ color: 'var(--warning)' }}
          >
            Attention
          </span>
        )}
      </div>

      <div
        className="h-1 rounded-full overflow-hidden"
        style={{ backgroundColor: 'var(--surface-2)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${100 - usagePercent}%`,
            backgroundColor: isCritical
              ? 'var(--red)'
              : isWarning
              ? 'var(--warning)'
              : 'var(--accent)',
          }}
        />
      </div>
    </div>
  )
}
