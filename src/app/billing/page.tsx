import { type Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Loader2, CreditCard, TrendingUp, ArrowUpRight, Check } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Mon abonnement — Emind',
  description: 'Gérez votre abonnement Emind et consultez votre utilisation.',
}

export const dynamic = 'force-dynamic'

interface SubscriptionRow {
  plan_id: string
  plan_name: string
  subscription_status: string
  current_period_start: string | null
  current_period_end: string | null
  stripe_subscription_id: string | null
}

interface UsageRow {
  messages_sent: number
  messages_limit: number
}

export default async function BillingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirectTo=/billing')
  }

  // Parallel fetch for subscription + usage
  const [subscriptionResult, usageResult] = await Promise.all([
    supabase
      .from('user_subscriptions')
      .select('plan_id, plan_name, subscription_status, current_period_start, current_period_end, stripe_subscription_id')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('monthly_usage')
      .select('messages_sent, messages_limit')
      .eq('user_id', user.id)
      .single(),
  ])

  const subscription: SubscriptionRow | null = subscriptionResult.data
  const usage: UsageRow | null = usageResult.data

  // No active plan
  if (!subscription) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 rounded-full bg-[var(--border-md)] flex items-center justify-center mx-auto mb-4">
            <CreditCard size={20} className="text-[var(--text-2)]" strokeWidth={1.5} />
          </div>
          <h1 className="text-xl font-semibold text-[var(--text-1)] mb-2">
            Aucun plan actif
          </h1>
          <p className="text-sm text-[var(--text-2)] mb-6">
            Vous n&apos;avez pas encore souscrit à un abonnement. Choisissez un plan pour accéder à Emind.
          </p>
          <Link
            href="/#pricing"
            className="inline-flex items-center justify-center h-9 px-6 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium text-sm transition-colors duration-150"
          >
            Voir les plans
          </Link>
        </div>
      </div>
    )
  }

  const sent = usage?.messages_sent ?? 0
  const limit = usage?.messages_limit ?? 0
  const remaining = Math.max(0, limit - sent)
  const percentage = limit > 0 ? (sent / limit) * 100 : 0

  const statusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'trialing':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'past_due':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      case 'canceled':
      case 'inactive':
        return 'bg-[var(--red)]/10 text-[var(--red)] border-[var(--red)]/20'
      default:
        return 'bg-[var(--border)] text-[var(--text-2)] border-[var(--border-md)]'
    }
  }

  const statusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actif'
      case 'trialing': return 'Essai'
      case 'past_due': return 'En retard'
      case 'canceled': return 'Annulé'
      case 'inactive': return 'Inactif'
      default: return status
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[var(--text-1)] mb-1">
            Mon abonnement
          </h1>
          <p className="text-sm text-[var(--text-2)]">
            Gérez votre plan et consultez votre utilisation mensuelle.
          </p>
        </div>

        {/* Plan card */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 mb-4">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-semibold text-[var(--text-1)]">
                  {subscription.plan_name}
                </h2>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusBadgeClass(subscription.subscription_status)}`}
                >
                  {statusLabel(subscription.subscription_status)}
                </span>
              </div>
              {subscription.current_period_end && (
                <p className="text-xs text-[var(--text-2)]">
                  Renouvellement le {new Date(subscription.current_period_end).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              )}
            </div>

            {/* Manage subscription button */}
            <form action="/api/billing/portal" method="POST">
              <input type="hidden" name="returnUrl" value="/billing" />
              <button
                type="submit"
                className="inline-flex items-center justify-center h-8 px-3 rounded-lg border border-[var(--border-md)] hover:border-[var(--accent)] text-[var(--text-1)] text-xs font-medium transition-colors duration-150 gap-1.5"
              >
                <CreditCard size={13} strokeWidth={1.5} />
                Gérer mon abonnement
              </button>
            </form>
          </div>

          {/* Usage section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <TrendingUp size={14} className="text-[var(--text-2)]" strokeWidth={1.5} />
                <span className="text-sm text-[var(--text-2)]">Messages ce mois</span>
              </div>
              <span className="text-sm font-mono text-[var(--text-1)] tabular-nums">
                {remaining > 0 ? (
                  <>
                    <span className={percentage >= 90 ? 'text-[var(--red)]' : percentage >= 75 ? 'text-amber-500' : ''}>
                      {remaining}
                    </span>
                    <span className="text-[var(--text-2)]"> / {limit} restants</span>
                  </>
                ) : (
                  <span className="text-[var(--red)]">0 restants</span>
                )}
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  percentage >= 90
                    ? 'bg-[var(--red)]'
                    : percentage >= 75
                    ? 'bg-amber-500'
                    : 'bg-[var(--accent)]'
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>

            {remaining === 0 && (
              <p className="text-xs text-[var(--red)] flex items-center gap-1">
                <span>Limite atteinte ce mois.</span>
                <Link href="/#pricing" className="underline hover:no-underline font-medium">
                  Upgrader vers un plan supérieur →
                </Link>
              </p>
            )}
          </div>
        </div>

        {/* Current plan features */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 mb-4">
          <h3 className="text-sm font-semibold text-[var(--text-1)] mb-4">
            Inclus dans votre plan
          </h3>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-sm text-[var(--text-2)]">
              <Check size={14} className="text-[var(--accent)] shrink-0" strokeWidth={2} />
              <span>{limit} messages par mois</span>
            </li>
            <li className="flex items-center gap-2 text-sm text-[var(--text-2)]">
              <Check size={14} className="text-[var(--accent)] shrink-0" strokeWidth={2} />
              <span>Assistant email IA</span>
            </li>
            <li className="flex items-center gap-2 text-sm text-[var(--text-2)]">
              <Check size={14} className="text-[var(--accent)] shrink-0" strokeWidth={2} />
              <span>Support par email</span>
            </li>
          </ul>
        </div>

        {/* Upgrade section */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h3 className="text-sm font-semibold text-[var(--text-1)] mb-4">
            Besoin de plus ?
          </h3>
          <p className="text-xs text-[var(--text-2)] mb-4">
            Passez à un plan supérieur pour augmenter votre limite de messages mensuelle.
          </p>
          <Link
            href="/#pricing"
            className="inline-flex items-center justify-center h-9 px-4 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium text-sm transition-colors duration-150 gap-2"
          >
            Voir les plans disponibles
            <ArrowUpRight size={14} strokeWidth={2} />
          </Link>
        </div>
      </div>
    </div>
  )
}
