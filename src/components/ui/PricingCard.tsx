'use client'

import { useState } from 'react'
import { Check, X, Loader2, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export type PlanId = 'start' | 'scale' | 'team'

export type PricingFeature = {
  text: string
  included: boolean
}

export type PricingPlanData = {
  id: PlanId
  name: string
  priceMonthly: number
  priceAnnual: number
  description: string
  features: PricingFeature[]
  highlighted: boolean
  badge?: string
}

const PLANS: PricingPlanData[] = [
  {
    id: 'start',
    name: 'Start',
    priceMonthly: 19,
    priceAnnual: 15,
    description: 'Pour découvrir EmailMind et traiter vos premiers emails avec l\'IA.',
    features: [
      { text: '10 messages / mois', included: true },
      { text: '1 boîte email connectée', included: true },
      { text: 'Détection d\'opportunités basique', included: true },
      { text: 'Notifications par email', included: true },
      { text: 'Génération de réponses IA', included: false },
      { text: 'Boîte partagée équipe', included: false },
      { text: 'Intégrations CRM', included: false },
    ],
    highlighted: false,
    badge: undefined,
  },
  {
    id: 'scale',
    name: 'Scale',
    priceMonthly: 49,
    priceAnnual: 39,
    description: 'Pour les équipes qui répondent à +50 messages clients par mois.',
    features: [
      { text: '50 messages / mois', included: true },
      { text: '3 boîtes email connectées', included: true },
      { text: 'Détection d\'opportunités avancée (score + ton)', included: true },
      { text: 'Génération de réponses IA', included: true },
      { text: 'Notifications push + Slack', included: true },
      { text: '1 espace équipe partagé', included: true },
      { text: 'Intégrations CRM natives', included: false },
    ],
    highlighted: true,
    badge: 'Populaire',
  },
  {
    id: 'team',
    name: 'Team',
    priceMonthly: 99,
    priceAnnual: 79,
    description: 'Pour les équipes support et sales qui dépassent 100 emails/jour.',
    features: [
      { text: '100 messages / mois', included: true },
      { text: '10 boîtes email connectées', included: true },
      { text: 'Détection avancée + urgence + ton', included: true },
      { text: 'Génération de réponses IA illimitée', included: true },
      { text: 'Notifications push + Slack + Teams', included: true },
      { text: 'Jusqu\'à 10 collaborateurs', included: true },
      { text: 'Intégrations CRM (HubSpot, Pipedrive)', included: true },
    ],
    highlighted: false,
    badge: undefined,
  },
]

interface PricingCardProps {
  plan: PricingPlanData
  annual: boolean
}

export function PricingCard({ plan, annual }: PricingCardProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const price = annual ? plan.priceAnnual : plan.priceMonthly

  async function handleCheckout() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: plan.id }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Une erreur est survenue')
      }
      const { url } = await res.json()
      window.location.href = url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      setLoading(false)
    }
  }

  const cardStyle = plan.highlighted
    ? 'pricing-card--pro'
    : plan.id === 'start'
    ? 'pricing-card--free'
    : 'pricing-card--ent'

  return (
    <div className={cn('pricing-card', cardStyle)}>
      {/* Topbar gradient */}
      <div className="pricing-card__topbar" />

      {/* Badge */}
      {plan.badge && (
        <div className="flex justify-center mb-4">
          <span className="pricing-card__badge">{plan.badge}</span>
        </div>
      )}

      {/* Name */}
      <p className="pricing-card__name">{plan.name}</p>

      {/* Description */}
      <p className="pricing-card__desc">{plan.description}</p>

      {/* Price */}
      <div className="pricing-card__price">
        <span className="pricing-card__amount">{price}€</span>
        <span className="pricing-card__period">/ mois</span>
      </div>

      {/* Divider */}
      <div className="pricing-card__divider" />

      {/* Features */}
      <ul className="pricing-card__features">
        {plan.features.map((f, i) => (
          <li key={i} className="pricing-card__feature">
            {f.included ? (
              <Check className="pricing-card__check pricing-card__check--ok" size={18} strokeWidth={1.5} />
            ) : (
              <X className="pricing-card__check pricing-card__check--no" size={18} strokeWidth={1.5} />
            )}
            <span style={{ color: f.included ? 'var(--muted)' : 'var(--dim)' }}>
              {f.text}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        onClick={handleCheckout}
        disabled={loading}
        className={cn(
          'btn-plan',
          plan.highlighted ? 'btn-plan-primary' : 'btn-plan-ghost',
          'flex items-center justify-center gap-2',
        )}
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin shrink-0" />
            <span>Redirection…</span>
          </>
        ) : (
          <>
            <span>{plan.highlighted ? 'Commencer avec ' : 'Commencer avec '}{plan.name}</span>
            <ArrowRight size={16} strokeWidth={1.5} className="shrink-0" />
          </>
        )}
      </button>

      {/* Error message */}
      {error && (
        <div
          className="mt-3 px-3 py-2 rounded-lg text-sm text-left"
          style={{
            background: 'rgba(248, 113, 113, 0.08)',
            border: '1px solid rgba(248, 113, 113, 0.2)',
            color: 'var(--red)',
          }}
        >
          {error}
        </div>
      )}
    </div>
  )
}
