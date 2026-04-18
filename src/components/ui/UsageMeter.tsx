'use client'

import { useMemo } from 'react'
import { AlertTriangle, Zap } from 'lucide-react'
import Link from 'next/link'

interface UsageMeterProps {
  plan: string
  messagesUsed: number
  messagesLimit: number
  renewalDate: string
  isLoading: boolean
}

export function UsageMeter({
  plan,
  messagesUsed,
  messagesLimit,
  renewalDate,
  isLoading,
}: UsageMeterProps) {
  const percentage = useMemo(() => {
    if (messagesLimit === 0) return 0
    return Math.min((messagesUsed / messagesLimit) * 100, 100)
  }, [messagesUsed, messagesLimit])

  const remaining = useMemo(
    () => Math.max(messagesLimit - messagesUsed, 0),
    [messagesUsed, messagesLimit]
  )

  const isCritical = percentage >= 90
  const isWarning = percentage >= 70 && percentage < 90

  const formattedRenewal = useMemo(() => {
    try {
      const date = new Date(renewalDate)
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return renewalDate
    }
  }, [renewalDate])

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)]">
        <div className="w-20 h-3 rounded animate-pulse" style={{ backgroundColor: 'var(--border)' }} />
        <div className="flex-1 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--border)' }} />
        <div className="w-16 h-3 rounded animate-pulse" style={{ backgroundColor: 'var(--border)' }} />
      </div>
    )
  }

  return (
    <div
      className="flex flex-col gap-2 px-4 py-3 rounded-xl border bg-[var(--surface)]"
      style={{
        borderColor: isCritical
          ? 'rgba(249, 115, 22, 0.35)'
          : isWarning
          ? 'rgba(234, 179, 8, 0.35)'
          : 'var(--border)',
        backgroundColor: isCritical
          ? 'rgba(249, 115, 22, 0.04)'
          : isWarning
          ? 'rgba(234, 179, 8, 0.04)'
          : 'var(--surface)',
      }}
    >
      {/* Top row: plan name + renewal date */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {isCritical && (
            <AlertTriangle
              size={12}
              strokeWidth={2}
              style={{ color: 'var(--orange)' }}
            />
          )}
          {!isCritical && !isWarning && (
            <Zap
              size={12}
              strokeWidth={2}
              style={{ color: 'var(--accent)' }}
            />
          )}
          <span
            className="text-xs font-medium capitalize"
            style={{ color: 'var(--text-2)' }}
          >
            {plan}
          </span>
        </div>
        <span
          className="text-xs"
          style={{ color: 'var(--text-3)' }}
        >
          Renouvellement {formattedRenewal}
        </span>
      </div>

      {/* Progress bar row */}
      <div className="flex items-center gap-3">
        {/* Bar */}
        <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-[var(--border)]">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${percentage}%`,
              backgroundColor: isCritical
                ? 'var(--orange)'
                : isWarning
                ? 'var(--yellow)'
                : 'var(--accent)',
            }}
          />
        </div>

        {/* Count */}
        <span
          className="text-xs font-medium tabular-nums flex-shrink-0"
          style={{
            color: isCritical
              ? 'var(--orange)'
              : isWarning
              ? 'var(--yellow)'
              : 'var(--text-2)',
          }}
        >
          {remaining} / {messagesLimit}
        </span>
      </div>

      {/* Upgrade prompt */}
      {isCritical && (
        <Link
          href="/#pricing"
          className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150"
          style={{
            backgroundColor: 'var(--orange)',
            color: '#fff',
          }}
        >
          <AlertTriangle size={10} strokeWidth={2.5} />
          Limite proche — Upgrader mon plan
        </Link>
      )}
    </div>
  )
}
