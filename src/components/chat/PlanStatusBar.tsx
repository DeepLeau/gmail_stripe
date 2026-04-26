'use client'

import type { SubscriptionData } from '@/lib/stripe/config'

interface PlanStatusBarProps {
  subscription: SubscriptionData
}

export function PlanStatusBar({ subscription }: PlanStatusBarProps) {
  const { plan, units_used, units_limit, units_remaining, status } = subscription

  if (!plan || status === 'free' || units_limit === null) {
    return null
  }

  const percentage = units_limit > 0 ? Math.min(100, (units_used / units_limit) * 100) : 0
  const isNearLimit = percentage >= 80
  const isAtLimit = units_remaining === 0

  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs">
      <span className="text-[var(--text-3)] shrink-0 font-medium uppercase tracking-wide">
        {plan}
      </span>
      <div className="flex-1 h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${percentage}%`,
            backgroundColor: isAtLimit
              ? 'var(--red)'
              : isNearLimit
              ? '#f59e0b'
              : 'var(--accent)',
          }}
        />
      </div>
      <span
        className="shrink-0 tabular-nums font-mono"
        style={{
          color: isAtLimit ? 'var(--red)' : 'var(--text-2)',
        }}
      >
        {units_used}/{units_limit}
      </span>
    </div>
  )
}
