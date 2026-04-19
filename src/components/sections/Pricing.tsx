'use client'

import { useState } from 'react'
import { Check, Loader2, ExternalLink } from 'lucide-react'
import { plans } from '@/lib/data'
import { createCheckoutSession } from '@/app/actions/checkout'

type CheckoutState = 'idle' | 'loading' | 'redirecting' | 'error'

interface PlanState {
  [planId: string]: CheckoutState
}

interface PlanFeature {
  text: string
  included: boolean
}

interface Plan {
  id: string
  name: string
  price: string
  description: string
  messagesLimit: number
  features: string[]
  cta: string
  highlighted: boolean
}

const PLANS: Plan[] = [
  {
    id: 'start',
    name: 'Start',
    price: '0',
    description: 'Pour découvrir Emind sans engagement.',
    messagesLimit: 10,
    features: ['10 réponses email / mois', '1 boîte mail connectée', 'Support email'],
    cta: 'Commencer gratuitement',
    highlighted: false,
  },
  {
    id: 'scale',
    name: 'Scale',
    price: '19',
    description: 'Pour les professionnels qui gèrent plusieurs boîtes email.',
    messagesLimit: 50,
    features: [
      '50 réponses email / mois',
      'Plusieurs boîtes mail',
      'Priorité de traitement',
      'Support prioritaire',
    ],
    cta: 'Passer à Scale',
    highlighted: true,
  },
  {
    id: 'team',
    name: 'Team',
    price: '49',
    description: 'Pour les équipes qui traitent un volume élevé de messages.',
    messagesLimit: 100,
    features: [
      '100 réponses email / mois',
      'Boîtes email illimitées',
      'Accès partagé',
      'Support dédié',
    ],
    cta: 'Passer à Team',
    highlighted: false,
  },
]

export function Pricing() {
  const [planStates, setPlanStates] = useState<PlanState>({})
  const [errorMessages, setErrorMessages] = useState<Record<string, string>>({})

  const handleCheckout = async (planId: string) => {
    setErrorMessages((prev) => {
      const next = { ...prev }
      delete next[planId]
      return next
    })

    setPlanStates((prev) => ({ ...prev, [planId]: 'loading' }))

    try {
      const result = await createCheckoutSession(planId as 'start' | 'scale' | 'team')

      if ('redirectTo' in result) {
        window.location.href = result.redirectTo
        return
      }

      if ('error' in result) {
        setPlanStates((prev) => ({ ...prev, [planId]: 'error' }))
        setErrorMessages((prev) => ({ ...prev, [planId]: result.error }))
        return
      }

      if ('url' in result) {
        setPlanStates((prev) => ({ ...prev, [planId]: 'redirecting' }))
        window.location.href = result.url
      }
    } catch {
      setPlanStates((prev) => ({ ...prev, [planId]: 'error' }))
      setErrorMessages((prev) => ({
        ...prev,
        [planId]: 'Une erreur inattendue est survenue.',
      }))
    }
  }

  const getButtonContent = (planId: string) => {
    const state = planStates[planId] ?? 'idle'
    switch (state) {
      case 'loading':
        return (
          <>
            <Loader2 size={15} className="animate-spin" strokeWidth={2} />
            <span>Chargement...</span>
          </>
        )
      case 'redirecting':
        return (
          <>
            <ExternalLink size={15} strokeWidth={2} />
            <span>Redirection vers le paiement...</span>
          </>
        )
      default: {
        const plan = PLANS.find((p) => p.id === planId)
        return <span>{plan?.cta ?? 'Choisir'}</span>
      }
    }
  }

  return (
    <section id="pricing" className="w-full py-24 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold text-[var(--text-1)] mb-3">
            Un tarif simple et transparent
          </h2>
          <p className="text-[var(--text-2)] text-base max-w-lg mx-auto">
            Choisissez le plan qui correspond à votre volume de messages. Aucun engagement.
          </p>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const state = planStates[plan.id] ?? 'idle'
            const isLoading = state === 'loading'
            const isRedirecting = state === 'redirecting'
            const isDisabled = isLoading || isRedirecting
            const errorMsg = errorMessages[plan.id]

            return (
              <div
                key={plan.id}
                className={`
                  relative flex flex-col rounded-xl border p-6
                  ${plan.highlighted
                    ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                    : 'border-[var(--border)] bg-[var(--card)]'
                  }
                `}
              >
                {/* Badge */}
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-[var(--accent)] text-white">
                      Le plus populaire
                    </span>
                  </div>
                )}

                {/* Plan header */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-[var(--text-1)] mb-1">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-3xl font-bold text-[var(--text-1)]">
                      {plan.price}
                    </span>
                    <span className="text-[var(--text-2)] text-sm">€ / mois</span>
                  </div>
                  <p className="text-[var(--text-2)] text-sm">{plan.description}</p>
                </div>

                {/* CTA button */}
                <button
                  onClick={() => handleCheckout(plan.id)}
                  disabled={isDisabled}
                  className={`
                    w-full h-9 px-4 rounded-lg font-medium text-sm transition-all duration-150
                    flex items-center justify-center gap-2
                    ${isRedirecting
                      ? 'bg-[var(--accent)]/60 text-white cursor-wait'
                      : isLoading
                      ? 'bg-[var(--accent)]/60 text-white cursor-not-allowed'
                      : plan.highlighted
                      ? 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white'
                      : 'bg-[var(--bg)] border border-[var(--border-md)] hover:border-[var(--accent)] text-[var(--text-1)] hover:text-[var(--accent)]'
                    }
                    disabled:cursor-not-allowed
                  `}
                  aria-label={`Choisir le plan ${plan.name}`}
                >
                  {getButtonContent(plan.id)}
                </button>

                {/* Error message */}
                {errorMsg && (
                  <p className="mt-2 text-xs text-[var(--red)] text-center" role="alert">
                    {errorMsg}
                  </p>
                )}

                {/* Divider */}
                <div className="my-6 border-t border-[var(--border)]" />

                {/* Features */}
                <ul className="flex flex-col gap-3 flex-1">
                  <li className="flex items-center gap-2 text-sm text-[var(--text-2)]">
                    <span className="shrink-0 text-xs font-mono bg-[var(--bg)] border border-[var(--border-md)] rounded px-1.5 py-0.5 text-[var(--text-1)]">
                      {plan.messagesLimit} msg
                    </span>
                    <span>par mois</span>
                  </li>
                  {plan.features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-2)]">
                      <Check
                        size={15}
                        className="shrink-0 mt-0.5 text-[var(--accent)]"
                        strokeWidth={2}
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-[var(--text-2)] mt-8">
          Paiement sécurisé par Stripe. Annulez à tout moment depuis votre tableau de bord.
        </p>
      </div>
    </section>
  )
}
