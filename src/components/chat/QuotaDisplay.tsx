'use client'

import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import type { SubscriptionData } from '@/lib/stripe/config'

interface QuotaDisplayProps {
  subscription: SubscriptionData
}

function getPlanDisplayName(plan: string | null): string {
  if (!plan) return 'Gratuit'
  const map: Record<string, string> = {
    start: 'Start',
    scale: 'Scale',
    team: 'Team',
    starter: 'Starter',
    growth: 'Growth',
    pro: 'Pro',
    free: 'Gratuit',
  }
  return map[plan.toLowerCase()] ?? plan
}

function getPlanColor(plan: string | null): { bg: string; text: string } {
  if (!plan) return { bg: 'bg-[var(--text-3)]', text: 'text-[var(--text-3)]' }
  const map: Record<string, { bg: string; text: string }> = {
    start: { bg: 'bg-blue-100', text: 'text-blue-700' },
    scale: { bg: 'bg-purple-100', text: 'text-purple-700' },
    team: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    starter: { bg: 'bg-blue-100', text: 'text-blue-700' },
    growth: { bg: 'bg-purple-100', text: 'text-purple-700' },
    pro: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  }
  return map[plan.toLowerCase()] ?? { bg: 'bg-gray-100', text: 'text-gray-700' }
}

export function QuotaDisplay({ subscription }: QuotaDisplayProps) {
  const { plan, units_limit, units_remaining, units_used } = subscription

  const planName = getPlanDisplayName(plan)
  const planColors = getPlanColor(plan)

  // Si pas d'abonnement ou illimité, on n'affiche rien
  if (!plan || units_limit === null) return null

  const usageRatio = units_limit > 0 ? units_used / units_limit : 0
  const remaining = units_remaining ?? 0

  // Barre de progression
  const barColor =
    usageRatio >= 0.9
      ? 'bg-red-400'
      : usageRatio >= 0.75
      ? 'bg-amber-400'
      : 'bg-[var(--accent)]'

  // Texte couleur restante
  const remainingColor =
    usageRatio >= 0.9
      ? 'text-red-600'
      : usageRatio >= 0.75
      ? 'text-amber-600'
      : 'text-[var(--text-2)]'

  // Warning banner si limite proche ou atteinte
  if (remaining === 0) {
    return (
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-sm">
        <AlertTriangle size={15} className="text-red-500 shrink-0" strokeWidth={2} />
        <p className="text-red-700 font-medium flex-1">
          Limite atteinte — {units_limit} messages / mois
        </p>
        <Link
          href="/#pricing"
          className="text-xs font-semibold text-red-600 hover:text-red-700 whitespace-nowrap"
        >
          Passer à un plan supérieur →
        </Link>
      </div>
    )
  }

  return (
    <div className="px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${planColors.bg} ${planColors.text}`}
          >
            {planName}
          </span>
          <span className="text-xs" style={{ color: 'var(--text-3)' }}>
            {units_limit} messages / mois
          </span>
        </div>
        <p className={`text-xs font-medium ${remainingColor}`}>
          {remaining} restant{remaining !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Barre de progression */}
      <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${Math.min(100, usageRatio * 100)}%`,
            backgroundColor: barColor,
          }}
        />
      </div>
    </div>
  )
}
