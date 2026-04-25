'use client'

import { Loader2 } from 'lucide-react'

interface PlanBadgeProps {
  planName: string
  used: number
  limit: number
  isLoading?: boolean
}

export function PlanBadge({ planName, used, limit, isLoading }: PlanBadgeProps) {
  const getBadgeStyle = () => {
    switch (planName.toLowerCase()) {
      case 'scale':
        return {
          backgroundColor: 'var(--accent-light)',
          color: 'var(--accent)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
        }
      case 'team':
        return {
          background: 'linear-gradient(135deg, var(--accent-light), var(--violet-light))',
          color: 'var(--accent)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
        }
      default:
        return {
          backgroundColor: 'var(--surface)',
          color: 'var(--text-2)',
          border: '1px solid var(--border)',
        }
    }
  }

  if (isLoading) {
    return (
      <div
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
        style={getBadgeStyle()}
      >
        <Loader2 size={12} className="animate-spin" />
        <span>Chargement...</span>
      </div>
    )
  }

  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
      style={getBadgeStyle()}
    >
      <span>{planName}</span>
      <span style={{ opacity: 0.5 }}>·</span>
      <span>
        {used}/{limit}
      </span>
    </div>
  )
}
