'use client'

import { Crown, Zap, Users } from 'lucide-react'

interface SubscriptionBadgeProps {
  plan: 'start' | 'scale' | 'team'
  remaining: number
  limit: number
  variant?: 'default' | 'compact'
}

const planConfig = {
  start: {
    label: 'Start',
    icon: Zap,
    className: 'bg-amber-100 text-amber-700 border-amber-200',
    iconClassName: 'text-amber-600',
  },
  scale: {
    label: 'Scale',
    icon: Zap,
    className: 'bg-blue-100 text-blue-700 border-blue-200',
    iconClassName: 'text-blue-600',
  },
  team: {
    label: 'Team',
    icon: Users,
    className: 'bg-purple-100 text-purple-700 border-purple-200',
    iconClassName: 'text-purple-600',
  },
}

export function SubscriptionBadge({
  plan,
  remaining,
  limit,
  variant = 'default',
}: SubscriptionBadgeProps) {
  const config = planConfig[plan]
  const Icon = config.icon

  const messageText = `${remaining}/${limit} messages`

  if (variant === 'compact') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full border ${config.className}`}>
        <Icon className={`w-3 h-3 ${config.iconClassName}`} />
        <span>{config.label}</span>
        <span className="opacity-70">·</span>
        <span>{messageText}</span>
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full border ${config.className}`}>
      <Icon className={`w-4 h-4 ${config.iconClassName}`} />
      <span>{config.label}</span>
      <span className="opacity-70">·</span>
      <span>{messageText}</span>
    </span>
  )
}
