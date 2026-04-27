'use client'

import { useEffect, useState } from 'react'

interface SubscriptionData {
  plan: string | null
  units_limit: number | null
  units_used: number
  current_period_end: string
}

type UsageState =
  | { status: 'loading' }
  | { status: 'ok'; data: SubscriptionData; percentage: number }
  | { status: 'quota_reached'; data: SubscriptionData }
  | { status: 'error' | 'unauthenticated' }

function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString)
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  } catch {
    return ''
  }
}

export function UsageMeter() {
  const [state, setState] = useState<UsageState>({ status: 'loading' })

  useEffect(() => {
    async function fetchUsage() {
      try {
        const res = await fetch('/api/stripe/usage')
        if (res.status === 401 || res.status === 403) {
          setState({ status: 'unauthenticated' })
          return
        }
        if (!res.ok) {
          setState({ status: 'error' })
          return
        }
        const data: SubscriptionData = await res.json()
        if (data.units_limit == null || data.units_limit === 0) {
          setState({ status: 'ok', data, percentage: 0 })
          return
        }
        const percentage = (data.units_used / data.units_limit) * 100
        if (percentage >= 100) {
          setState({ status: 'quota_reached', data })
        } else {
          setState({ status: 'ok', data, percentage })
        }
      } catch {
        setState({ status: 'error' })
      }
    }

    fetchUsage()
  }, [])

  if (state.status === 'loading') {
    return (
      <div className="flex items-center gap-3 py-2">
        <div className="h-5 w-20 bg-gray-200 rounded-full animate-pulse" />
        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-gray-300 rounded-full animate-pulse" />
        </div>
        <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
      </div>
    )
  }

  if (state.status === 'error' || state.status === 'unauthenticated') {
    return null
  }

  // Guard: only 'ok' and 'quota_reached' reach here
  if (state.status !== 'ok' && state.status !== 'quota_reached') {
    return null
  }

  const data = state.data
  const percentage = state.status === 'ok' ? state.percentage : 100

  const getBarColor = () => {
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 75) return 'bg-amber-500'
    return 'bg-blue-500'
  }

  const getTextColor = () => {
    if (percentage >= 100) return 'text-red-600'
    if (percentage >= 75) return 'text-amber-600'
    return 'text-[var(--text-2)]'
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        {/* Plan badge */}
        <span className="text-xs font-medium text-[var(--text-2)] uppercase tracking-wide">
          {data.plan ?? 'Free'}
        </span>

        {/* Counter */}
        <span className={`text-xs font-medium ${getTextColor()}`}>
          {data.units_used}{data.units_limit != null ? `/${data.units_limit}` : ''}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${getBarColor()}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {/* Status text */}
      {percentage >= 100 ? (
        <div className="flex items-center justify-between">
          <span className="text-xs text-red-600 font-medium">Limite atteinte</span>
          <a
            href="/#pricing"
            className="text-xs text-blue-600 hover:text-blue-700 font-medium underline underline-offset-2"
          >
            Passer à un plan supérieur ↗
          </a>
        </div>
      ) : percentage >= 75 ? (
        <span className="text-xs text-amber-600">
          Renouvellement le {formatDate(data.current_period_end)}
        </span>
      ) : (
        <span className="text-xs text-[var(--text-3)]">
          Renouvellement le {formatDate(data.current_period_end)}
        </span>
      )}
    </div>
  )
}
