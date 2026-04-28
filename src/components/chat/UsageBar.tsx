'use client'

import { UNIT_LABEL, UNIT_LABEL_PLURAL } from '@/lib/stripe/config'
import { getPlanDisplayName } from '@/lib/stripe/config'
import type { StripePlanName } from '@/lib/stripe/config'

interface UsageBarProps {
  plan: string | null
  unitsUsed: number
  unitsLimit: number | null
}

export function UsageBar({ plan, unitsUsed, unitsLimit }: UsageBarProps) {
  const limit = unitsLimit ?? 0
  const percentage = limit > 0 ? Math.min(100, (unitsUsed / limit) * 100) : 0
  const remaining = limit > 0 ? Math.max(0, limit - unitsUsed) : null

  const label = plan
    ? getPlanDisplayName(plan as StripePlanName)
    : 'Gratuit'

  const isLimitReached = remaining === 0 && unitsLimit !== null && unitsLimit > 0

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${percentage}%`,
            backgroundColor: isLimitReached ? 'var(--red)' : percentage >= 90 ? 'var(--orange, var(--red))' : 'var(--accent)',
          }}
        />
      </div>
      <span className="text-xs shrink-0" style={{ color: isLimitReached ? 'var(--red)' : 'var(--text-3)' }}>
        {isLimitReached
          ? `0 ${UNIT_LABEL_PLURAL} restants · Plan ${label} · Limite atteinte`
          : remaining !== null
            ? `${remaining} ${remaining === 1 ? UNIT_LABEL : UNIT_LABEL_PLURAL}`
            : `${unitsUsed} / ∞`}
        {!isLimitReached && (
          <>
            {' · '}
            <span style={{ color: 'var(--text-2)' }}>{label}</span>
          </>
        )}
      </span>
    </div>
  )
}
