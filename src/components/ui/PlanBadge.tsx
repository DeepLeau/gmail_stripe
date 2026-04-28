'use client'

interface PlanBadgeProps {
  plan: string | null
}

export function PlanBadge({ plan }: PlanBadgeProps) {
  if (!plan) return null

  const label =
    plan === 'start' ? 'Start' :
    plan === 'scale' ? 'Scale' :
    plan === 'team' ? 'Team' :
    plan

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
      style={{
        backgroundColor: 'var(--accent-light)',
        color: 'var(--accent)',
      }}
    >
      {label}
    </span>
  )
}
