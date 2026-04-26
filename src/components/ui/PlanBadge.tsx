interface PlanBadgeProps {
  planName: string
}

const PLAN_COLORS: Record<string, { bg: string; text: string }> = {
  free: { bg: 'var(--border)', text: 'var(--text-2)' },
  start: { bg: 'var(--accent-light)', text: 'var(--accent)' },
  scale: { bg: 'var(--accent)', text: '#fff' },
  team: { bg: 'var(--violet)', text: '#fff' },
}

const PLAN_LABELS: Record<string, string> = {
  free: 'Gratuit',
  start: 'Start',
  scale: 'Scale',
  team: 'Team',
}

export function PlanBadge({ planName }: PlanBadgeProps) {
  const colors = PLAN_COLORS[planName] ?? PLAN_COLORS.free
  const label = PLAN_LABELS[planName] ?? planName

  return (
    <span
      className="inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-widest"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
      }}
    >
      {label}
    </span>
  )
}
