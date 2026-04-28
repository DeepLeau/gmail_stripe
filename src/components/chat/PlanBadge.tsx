'use client'

interface PlanBadgeProps {
  plan: string
  messagesUsed: number
  messagesLimit: number
  resetAt?: string | null
}

export function PlanBadge({ plan, messagesUsed, messagesLimit, resetAt }: PlanBadgeProps) {
  const remaining = Math.max(0, messagesLimit - messagesUsed)
  const percentage = Math.min(100, (messagesUsed / messagesLimit) * 100)

  return (
    <div
      className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg"
      style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: 'var(--accent)' }}
        >
          {plan}
        </span>
        <span className="text-xs" style={{ color: 'var(--text-3)' }}>
          {remaining} / {messagesLimit}
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="h-1 rounded-full overflow-hidden"
        style={{ backgroundColor: 'var(--border)' }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${percentage}%`,
            backgroundColor: percentage >= 90 ? 'var(--red)' : 'var(--accent)',
          }}
        />
      </div>

      {resetAt && (
        <span className="text-[10px] hidden sm:inline" style={{ color: 'var(--text-3)' }}>
          réinitialise le {new Date(resetAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
        </span>
      )}
    </div>
  )
}
