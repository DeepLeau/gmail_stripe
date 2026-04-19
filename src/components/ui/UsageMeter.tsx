'use client'

import { cn } from '@/lib/utils'
import type { BillingData } from '@/lib/hooks/useUserBilling'

type UsageMeterProps = {
  data: BillingData
  isLoading?: boolean
}

const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  start: 'Start',
  scale: 'Scale',
  team: 'Team',
}

const WARNING_THRESHOLD = 0.75
const CRITICAL_THRESHOLD = 0.9

export function UsageMeter({ data, isLoading }: UsageMeterProps) {
  const pct =
    data.messages_limit > 0
      ? (data.messages_used / data.messages_limit) * 100
      : 0

  const isWarning = pct >= WARNING_THRESHOLD * 100
  const isCritical = pct >= CRITICAL_THRESHOLD * 100

  const barColor = isCritical
    ? 'var(--red)'
    : isWarning
    ? 'var(--yellow)'
    : 'var(--accent)'

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-5 w-20 animate-pulse rounded bg-white/[0.06]" />
        <div className="h-1.5 w-20 animate-pulse rounded-full bg-white/[0.06]" />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {/* Plan badge */}
      <span
        className={cn(
          'inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap',
          data.plan === 'free'
            ? 'bg-white/[0.06] text-[var(--text-3)] border border-[var(--border-md)]'
            : 'bg-[var(--accent)]/10 text-[var(--accent-hi)] border border-[var(--accent)]/25'
        )}
      >
        {PLAN_LABELS[data.plan] ?? data.plan}
      </span>

      {/* Messages remaining */}
      <span
        className={cn(
          'text-[11px] font-medium tabular-nums whitespace-nowrap',
          isCritical
            ? 'text-[var(--red)]'
            : isWarning
            ? 'text-[var(--yellow)]'
            : 'text-[var(--text-3)]'
        )}
      >
        {data.messages_remaining} restant
        {data.messages_remaining === 1 ? '' : 's'}
      </span>

      {/* Progress bar */}
      <div className="w-16 h-1 rounded-full overflow-hidden bg-white/[0.06]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  )
}
