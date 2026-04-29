'use client'

import { UNIT_LABEL, UNIT_LABEL_PLURAL } from '@/lib/stripe/config'

interface QuotaDisplayProps {
  plan: string | null
  unitsUsed: number
  unitsLimit: number | null
  remaining: number | null
  status: string
}

export function QuotaDisplay({ plan, unitsUsed, unitsLimit, remaining, status }: QuotaDisplayProps) {
  const isFree = !plan || status === 'free'
  const limit = isFree ? 0 : (unitsLimit ?? 0)
  const used = isFree ? 0 : unitsUsed
  const remainingVal = isFree ? 0 : (remaining ?? 0)
  const atLimit = !isFree && remainingVal <= 0

  if (isFree) {
    return (
      <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-3)' }}>
        <span>Plan gratuit</span>
        <span>·</span>
        <span>Limite de messages atteinte</span>
      </div>
    )
  }

  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0
  const barColor = atLimit
    ? 'var(--red)'
    : pct > 80
    ? 'var(--amber)'
    : 'var(--accent)'

  return (
    <div
      className="flex flex-col gap-1.5 px-3 py-2.5 rounded-xl"
      style={{
        backgroundColor: 'var(--bg)',
        border: `1px solid ${atLimit ? 'var(--red)/20' : 'var(--border)'}`,
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium capitalize" style={{ color: 'var(--text-2)' }}>
            {plan}
          </span>
          {atLimit && (
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
              style={{ backgroundColor: 'var(--red)/10', color: 'var(--red)' }}
            >
              Limite atteinte
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-3)' }}>
          <span>
            {remainingVal} {remainingVal === 1 ? UNIT_LABEL : UNIT_LABEL_PLURAL} restants
          </span>
          <span>/</span>
          <span>{limit}</span>
        </div>
      </div>
      <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${pct}%`,
            backgroundColor: barColor,
          }}
        />
      </div>
    </div>
  )
}
