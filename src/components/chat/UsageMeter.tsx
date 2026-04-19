'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, AlertTriangle, TrendingUp, ArrowUpRight } from 'lucide-react'

interface UsageData {
  sent: number
  limit: number
  remaining: number
}

interface PlanData {
  name: string
  status?: string
}

interface UsageMeterProps {
  usage?: UsageData
  plan?: PlanData
}

type MeterState = 'loading' | 'empty' | 'active' | 'warning' | 'critical' | 'exceeded'

function computeMeterState(usage: UsageData | undefined, plan: PlanData | undefined): MeterState {
  if (!plan) return 'empty'
  if (!usage) return 'loading'
  if (usage.limit === 0) return 'empty'
  if (usage.remaining === 0) return 'exceeded'
  const percentage = (usage.sent / usage.limit) * 100
  if (percentage >= 90) return 'critical'
  if (percentage >= 75) return 'warning'
  return 'active'
}

function ProgressBar({ percentage, state }: { percentage: number; state: MeterState }) {
  const colorMap: Record<MeterState, string> = {
    loading: 'bg-[var(--text-2)]',
    empty: 'bg-[var(--text-2)]',
    active: 'bg-[var(--accent)]',
    warning: 'bg-amber-500',
    critical: 'bg-[var(--red)]',
    exceeded: 'bg-[var(--red)]',
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${colorMap[state]}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <span className="text-xs font-mono text-[var(--text-2)] shrink-0">
        {percentage.toFixed(0)}%
      </span>
    </div>
  )
}

export function UsageMeter({ usage, plan }: UsageMeterProps) {
  const state = computeMeterState(usage, plan)
  const [dismissedExceeded, setDismissedExceeded] = useState(false)

  // Loading skeleton
  if (state === 'loading') {
    return (
      <div className="flex items-center gap-3 px-4 py-2 animate-pulse">
        <div className="w-4 h-4 rounded bg-[var(--border-md)]" />
        <div className="flex-1 h-1.5 rounded bg-[var(--border-md)]" />
        <div className="w-16 h-3 rounded bg-[var(--border-md)]" />
      </div>
    )
  }

  // No active plan
  if (state === 'empty') {
    return (
      <div className="flex items-center gap-2 px-4 py-2">
        <TrendingUp size={14} className="text-[var(--text-2)] shrink-0" strokeWidth={1.5} />
        <p className="text-xs text-[var(--text-2)]">
          {'Aucun plan actif — '}
          <Link
            href="/"
            className="text-[var(--accent)] hover:underline"
          >
            choisissez un plan
          </Link>
          {' pour continuer.'}
        </p>
      </div>
    )
  }

  const percentage = usage!.limit > 0 ? (usage!.sent / usage!.limit) * 100 : 0
  const isExceeded = state === 'exceeded' && !dismissedExceeded

  return (
    <div className="space-y-2">
      {/* Exceeded banner */}
      {isExceeded && (
        <div className="mx-4 flex items-center gap-2 p-2.5 rounded-lg bg-[var(--red)]/10 border border-[var(--red)]/20">
          <AlertTriangle
            size={14}
            className="text-[var(--red)] shrink-0"
            strokeWidth={1.5}
          />
          <p className="text-xs text-[var(--red)] flex-1">
            Limite de messages atteinte
          </p>
          <Link
            href="/billing"
            className="inline-flex items-center gap-1 text-xs font-medium text-[var(--red)] hover:underline shrink-0"
          >
            Upgrader mon plan
            <ArrowUpRight size={12} strokeWidth={2} />
          </Link>
        </div>
      )}

      {/* Usage bar */}
      <div className="flex items-center gap-3 px-4 py-2">
        <div className="flex items-center gap-1.5 shrink-0">
          {state === 'critical' || state === 'exceeded' ? (
            <AlertTriangle size={13} className="text-[var(--red)]" strokeWidth={1.5} />
          ) : state === 'warning' ? (
            <AlertTriangle size={13} className="text-amber-500" strokeWidth={1.5} />
          ) : (
            <TrendingUp size={13} className="text-[var(--text-2)]" strokeWidth={1.5} />
          )}
          <span className="text-xs text-[var(--text-2)]">
            {plan?.name ?? 'Plan'}
          </span>
        </div>

        <ProgressBar percentage={percentage} state={state} />

        <span className="text-xs font-mono text-[var(--text-2)] shrink-0 tabular-nums">
          <span className={state === 'exceeded' ? 'text-[var(--red)]' : ''}>
            {usage!.remaining}
          </span>
          <span className="text-[var(--text-2)]"> / {usage!.limit}</span>
        </span>
      </div>
    </div>
  )
}
