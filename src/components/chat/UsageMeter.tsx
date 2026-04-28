'use client'

import { useEffect, useState } from 'react'
import type { SubscriptionData } from '@/lib/stripe/config'

interface UsageMeterProps {
  messagesUsed: number
  messagesLimit: number
  planName: string | null
}

export function UsageMeter({ messagesUsed, messagesLimit, planName }: UsageMeterProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Render skeleton to avoid hydration mismatch on client
    return (
      <div className="h-5 w-24 rounded bg-gray-100 animate-pulse" />
    )
  }

  const remaining = messagesLimit > 0 ? Math.max(0, messagesLimit - messagesUsed) : null
  const percent = messagesLimit > 0 ? Math.min(100, (messagesUsed / messagesLimit) * 100) : 0

  const isLow = remaining !== null && remaining <= messagesLimit * 0.1

  return (
    <div className="flex items-center gap-2">
      <span
        className="text-xs font-medium"
        style={{ color: isLow ? 'var(--red)' : 'var(--text-2)' }}
      >
        {remaining !== null
          ? `${remaining} msg restants`
          : planName ?? 'Gratuit'}
      </span>
      {remaining !== null && (
        <div className="w-16 h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${percent}%`,
              backgroundColor: isLow ? 'var(--red)' : 'var(--accent)',
            }}
          />
        </div>
      )}
    </div>
  )
}
