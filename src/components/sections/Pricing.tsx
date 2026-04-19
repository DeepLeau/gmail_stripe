'use client'

import { useState } from 'react'
import { Check, X, Loader2 } from 'lucide-react'

type PlanKey = 'start' | 'scale' | 'team'

interface PlanState {
  loading: boolean
  error: string | null
}

const plans = [
  {
    key: 'start' as PlanKey,
    badge: 'Start',
    badgeColor: 'text-graphite-900',
    price: '29',
    highlight: false,
    features: [
      { text: '10 messages / mois', included: true },
      { text: '1 utilisateur', included: true },
      { text: 'Support par email', included: true },
      { text: 'Analytics de base', included: true },
      { text: 'Utilisateurs multiples', included: false },
      { text: 'Support prioritaire', included: false },
      { text: 'Webhooks API', included: false },
    ],
    cta: 'Choisir Start',
  },
  {
    key: 'scale' as PlanKey,
    badge: 'Populaire',
    badgeColor: 'text-amber',
    price: '79',
    highlight: true,
    features: [
      { text: '50 messages / mois', included: true },
      { text: '3 utilisateurs', included: true },
      { text: 'Support prioritaire', included: true },
      { text: 'Analytics avancés', included: true },
      { text: 'Utilisateurs multiples', included: true },
      { text: 'Webhooks API', included: false },
    ],
    cta: 'Choisir Scale',
  },
  {
    key: 'team' as PlanKey,
    badge: 'Team',
    badgeColor: 'text-graphite-900',
    price: '149',
    highlight: false,
    features: [
      { text: '100 messages / mois', included: true },
      { text: 'Utilisateurs illimités', included: true },
      { text: 'Support dédié', included: true },
      { text: 'Analytics avancés', included: true },
      { text: 'Webhooks API', included: true },
    ],
    cta: 'Choisir Team',
  },
]

const bottomFeatures = [
  'Messages non utilisés non reportés',
  'Renouvellement automatique',
  'Annulation anytime',
  'Sans engagement',
]

export function Pricing() {
  const [states, setStates] = useState<Record<PlanKey, PlanState>>({
    start: { loading: false, error: null },
    scale: { loading: false, error: null },
    team: { loading: false, error: null },
  })

  async function handleCheckout(plan: PlanKey) {
    // Reset state
    setStates((prev) => ({
      ...prev,
      [plan]: { loading: true, error: null },
    }))

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })

      const data = await res.json()

      if (!res.ok) {
        setStates((prev) => ({
          ...prev,
          [plan]: {
            loading: false,
            error: data.error === 'invalid_plan'
              ? 'Plan invalide. Veuillez sélectionner un autre plan.'
              : 'Erreur de connexion. Veuillez réessayer.',
          },
        }))
        return
      }

      window.location.href = data.url
    } catch {
      setStates((prev) => ({
        ...prev,
        [plan]: {
          loading: false,
          error: 'Erreur de connexion. Veuillez réessayer.',
        },
      }))
    }
  }

  return (
    <section
      id="pricing"
      className="py-section px-container relative bg-surface observe-section"
    >
      <div className="scan-line absolute top-0 left-0 w-full h-[1px] bg-graphite-900/10" />
      <div className="max-w-[clamp(70rem,92vw,96rem)] mx-auto">
        <div className="text-center mb-16 reveal-up">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-amber inline-block mb-4">
            [06] TARIFS
          </span>
          <h2 className="font-display font-light text-h2 leading-[1.1] tracking-tight text-graphite-900 mb-4 mx-auto">
            Un quota adapté à votre rythme.
          </h2>
          <p className="font-mono text-xs text-graphite-500">
            Messages non utilisés non reportés · Sans engagement · Annulation anytime
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-graphite-900/10 reveal-up">
          {plans.map((plan) => {
            const state = states[plan.key]
            const isHighlight = plan.highlight

            return (
              <div
                key={plan.key}
                className={`p-8 md:p-10 flex flex-col ${isHighlight ? 'relative shadow-[0_0_40px_rgba(14,15,17,0.05)] z-10 -mt-2 -mb-2' : 'border-b md:border-b-0 md:border-r border-graphite-900/10 bg-canvas/30'} ${!isHighlight ? 'hover:bg-canvas' : ''} transition-colors`}
                style={isHighlight ? { borderTop: '2px solid #E8A020' } : undefined}
              >
                {/* Badge */}
                <span
                  className={`font-mono text-xs font-bold uppercase tracking-widest ${plan.badgeColor} mb-2 block`}
                >
                  {plan.badge}
                </span>

                {/* Price */}
                <div className="mb-6">
                  <span className="font-mono text-3xl font-medium text-graphite-900">
                    {plan.price} €
                  </span>
                  <span className="font-mono text-xs text-graphite-500 uppercase"> / mois</span>
                </div>

                {/* Description */}
                <p className="font-body text-sm text-graphite-500 mb-8 flex-grow">
                  {plan.key === 'start' &&
                    'Pour découvrir MessageMind et ses capacités de chat intelligent.'}
                  {plan.key === 'scale' &&
                    'Pour les équipes qui échangent activement et souhaitent prioriser les insights.'}
                  {plan.key === 'team' &&
                    'Pour les organisations qui veulent un chat sans limite avec un support dédié.'}
                </p>

                {/* Features */}
                <ul className="flex flex-col gap-3 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li
                      key={i}
                      className={`flex items-start gap-3 text-sm ${!feature.included ? 'opacity-40' : ''}`}
                    >
                      {feature.included ? (
                        <Check
                          size={16}
                          className="mt-0.5 flex-shrink-0"
                          strokeWidth={2}
                          style={{ color: '#E8A020' }}
                        />
                      ) : (
                        <X
                          size={16}
                          className="mt-0.5 flex-shrink-0"
                          strokeWidth={2}
                          style={{ color: '#5C5F66' }}
                        />
                      )}
                      {feature.text}
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => handleCheckout(plan.key)}
                  disabled={state.loading}
                  className={`relative w-full py-3 font-mono text-xs font-medium uppercase tracking-[0.1em] flex items-center justify-center gap-2 rounded-none transition-all duration-300 hover:-translate-y-0.5 group disabled:opacity-60 disabled:cursor-not-allowed ${
                    isHighlight
                      ? 'bg-gradient-to-b from-graphite-800 to-graphite-900 text-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_4px_20px_rgba(14,15,17,0.2)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_8px_32px_rgba(14,15,17,0.3)]'
                      : 'bg-surface border border-graphite-900/10 text-graphite-900 shadow-[0_2px_10px_rgba(14,15,17,0.02)] hover:shadow-[0_8px_24px_rgba(14,15,17,0.06)] hover:border-graphite-900/20'
                  }`}
                >
                  {state.loading ? (
                    <>
                      <Loader2 size={14} className="animate-spin shrink-0" />
                      <span>Redirection vers Stripe...</span>
                    </>
                  ) : (
                    plan.cta
                  )}
                </button>

                {/* Error message */}
                {state.error && (
                  <p className="mt-3 font-mono text-xs text-red-500 text-center flex items-center justify-center gap-1.5">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="shrink-0"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {state.error}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {/* Bottom features row */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-12 reveal-up">
          {bottomFeatures.map((feat, i) => (
            <div key={i} className="flex items-center gap-2 font-mono text-xs text-graphite-500 uppercase tracking-widest">
              <span style={{ color: '#10B981' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
              </span>
              {feat}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
