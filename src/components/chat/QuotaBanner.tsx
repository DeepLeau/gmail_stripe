'use client'

import Link from 'next/link'
import { AlertTriangle, Zap } from 'lucide-react'
import type { SubscriptionInfo } from '@/lib/chat/types'

interface QuotaBannerProps {
  subscription: SubscriptionInfo
  onUpgrade?: () => void
}

export function QuotaBanner({ subscription, onUpgrade }: QuotaBannerProps) {
  const { messagesUsed, messagesLimit } = subscription
  const remaining = messagesLimit - messagesUsed
  const remainingPercent = (remaining / messagesLimit) * 100

  // Calculate banner level
  let level: 'idle' | 'warning' | 'critical' | 'exceeded'

  if (remainingPercent <= 0) {
    level = 'exceeded'
  } else if (remainingPercent < 25) {
    level = 'critical'
  } else if (remainingPercent <= 50) {
    level = 'warning'
  } else {
    level = 'idle'
  }

  // Don't render if idle
  if (level === 'idle') {
    return null
  }

  const styles = {
    warning: {
      bg: 'rgba(234, 179, 8, 0.1)',
      border: 'rgba(234, 179, 8, 0.3)',
      text: '#ca8a04',
      icon: AlertTriangle,
    },
    critical: {
      bg: 'rgba(249, 115, 22, 0.1)',
      border: 'rgba(249, 115, 22, 0.3)',
      text: '#ea580c',
      icon: AlertTriangle,
    },
    exceeded: {
      bg: 'rgba(239, 68, 68, 0.1)',
      border: 'rgba(239, 68, 68, 0.3)',
      text: 'var(--red)',
      icon: Zap,
    },
  }

  const style = styles[level]
  const Icon = style.icon

  return (
    <div
      className="mb-4 p-3 rounded-lg flex items-center gap-3"
      style={{
        backgroundColor: style.bg,
        border: `1px solid ${style.border}`,
      }}
    >
      <Icon size={16} style={{ color: style.text }} strokeWidth={1.5} className="shrink-0" />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: style.text }}>
          {level === 'exceeded' && 'Quota de messages atteint'}
          {level === 'critical' && 'Messages presque épuisés'}
          {level === 'warning' && 'Quota en baisse'}
        </p>
        <p className="text-xs mt-0.5" style={{ color: style.text, opacity: 0.8 }}>
          {level === 'exceeded' && (
            <>Vous avez utilisé vos {messagesLimit} messages mensuels.</>
          )}
          {(level === 'warning' || level === 'critical') && (
            <>
              {remaining} / {messagesLimit} messages restants ce mois.
            </>
          )}
        </p>
      </div>

      {level === 'exceeded' && (
        <Link
          href="/settings/billing"
          onClick={onUpgrade}
          className="h-8 px-3 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 shrink-0
                     transition-colors duration-150"
          style={{
            backgroundColor: style.text,
            color: '#fff',
          }}
        >
          Upgrader mon plan
        </Link>
      )}
    </div>
  )
}
