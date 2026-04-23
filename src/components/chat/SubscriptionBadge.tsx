'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

type SubscriptionData = {
  plan: string
  messages_limit: number
  messages_used: number
  remaining: number
}

type BadgeState = 'loading' | 'idle' | 'limit_reached'

export function SubscriptionBadge() {
  const [state, setState] = useState<BadgeState>('loading')
  const [data, setData] = useState<SubscriptionData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSubscription() {
      const supabase = createClient()
      if (!supabase) {
        setState('idle')
        setData({ plan: 'Free', messages_limit: 10, messages_used: 0, remaining: 10 })
        return
      }

      const { data: sessionData } = await supabase.auth.getSession()

      if (!sessionData?.session) {
        setState('idle')
        setData({ plan: 'Free', messages_limit: 10, messages_used: 0, remaining: 10 })
        return
      }

      try {
        const response = await fetch('/api/subscription/limit-reached', {
          headers: {
            Authorization: `Bearer ${sessionData.session.access_token}`,
          },
        })

        if (!response.ok) {
          if (response.status === 404) {
            setState('idle')
            setData({ plan: 'Free', messages_limit: 10, messages_used: 0, remaining: 10 })
          } else {
            throw new Error('Failed to fetch subscription')
          }
          return
        }

        const subscriptionData: SubscriptionData = await response.json()
        setData(subscriptionData)
        setState(subscriptionData.remaining <= 0 ? 'limit_reached' : 'idle')
      } catch {
        setError('Impossible de charger l\'abonnement')
        setState('idle')
      }
    }

    fetchSubscription()
  }, [])

  if (state === 'loading') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-[var(--border-md)]">
        <div className="w-20 h-4 rounded bg-white/[0.07] animate-pulse" />
        <div className="w-16 h-4 rounded bg-white/[0.07] animate-pulse" />
      </div>
    )
  }

  if (!data) {
    return null
  }

  const progressPercent = data.messages_limit > 0
    ? (data.messages_used / data.messages_limit) * 100
    : 0

  const isLimitReached = state === 'limit_reached'

  return (
    <Link
      href="/pricing"
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors duration-150 hover:opacity-80 ${
        isLimitReached
          ? 'bg-red-500/10 border-red-500/30 text-red-400'
          : 'bg-white/[0.05] border-[var(--border-md)] text-[var(--text-2)]'
      }`}
    >
      <span className="text-xs font-medium">
        {data.plan}
      </span>
      <span className="text-xs text-[var(--text-3)]">·</span>
      <span className={`text-xs ${isLimitReached ? 'text-red-400' : 'text-[var(--text-2)]'}`}>
        {isLimitReached ? 'Limite atteinte' : `${data.remaining} msg restants`}
      </span>

      {!isLimitReached && (
        <div className="w-12 h-1.5 rounded-full bg-white/[0.1] overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
    </Link>
  )
}
