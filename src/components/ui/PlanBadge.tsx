'use client'

interface PlanBadgeProps {
  planName: string
  messagesRemaining: number
  quotaLimit: number
}

export function PlanBadge({ planName, messagesRemaining, quotaLimit }: PlanBadgeProps) {
  const displayName = planName.charAt(0).toUpperCase() + planName.slice(1)

  const isFree = planName === 'free' || !planName
  const isLow = messagesRemaining <= 2 && !isFree

  return (
    <div className="flex items-center gap-2">
      {/* Plan badge */}
      <span
        className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap"
        style={
          isFree
            ? {
                backgroundColor: 'var(--surface-3)',
                color: 'var(--text-3)',
                border: '1px solid var(--border-md)',
              }
            : {
                backgroundColor: 'rgba(99,102,241,0.10)',
                color: 'var(--accent-hi)',
                border: '1px solid rgba(99,102,241,0.20)',
              }
        }
      >
        {isFree ? 'Free' : displayName}
      </span>

      {/* Messages remaining */}
      <span
        className="text-[11px] whitespace-nowrap tabular-nums"
        style={{
          color: isLow ? 'var(--yellow)' : 'var(--text-3)',
          fontFamily: 'ui-monospace, monospace',
        }}
      >
        {messagesRemaining}/{quotaLimit}
      </span>
    </div>
  )
}
