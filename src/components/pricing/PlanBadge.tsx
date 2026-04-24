interface PlanBadgeProps {
  plan: string
  messagesRemaining: number
}

export function PlanBadge({ plan, messagesRemaining }: PlanBadgeProps) {
  const display = messagesRemaining < 0 ? 0 : messagesRemaining

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{
        backgroundColor: 'var(--accent-light)',
        color: 'var(--accent)',
        border: '1px solid rgba(59, 130, 246, 0.15)',
      }}
    >
      <span className="font-semibold uppercase tracking-wide">{plan}</span>
      <span style={{ color: 'var(--text-2)' }}>·</span>
      <span>{display} restants</span>
    </span>
  )
}
