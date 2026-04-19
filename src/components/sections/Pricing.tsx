'use client'

import { useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { Check, X, Loader2, AlertCircle } from 'lucide-react'

type StripePlanId = 'start' | 'scale' | 'team'

type CheckoutState = {
  status: 'idle' | 'loading' | 'error'
  planId: StripePlanId | null
  errorMessage: string | null
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

type PlanData = {
  id: StripePlanId
  name: string
  price: string
  period: string
  description: string
  messagesLimit: number
  features: Array<{ text: string; included: boolean }>
  cta: string
  highlighted: boolean
  badge?: string
}

const plans: PlanData[] = [
  {
    id: 'start',
    name: 'Start',
    price: '9 €',
    period: 'mois',
    description: 'Pour découvrir Emind et automatiser tes premières réponses.',
    messagesLimit: 10,
    features: [
      { text: '10 messages / mois', included: true },
      { text: '1 boîte email connectée', included: true },
      { text: 'Réponses en 10 secondes', included: true },
      { text: 'Support par email', included: true },
      { text: 'Multi-comptes', included: false },
      { text: 'Priorité de traitement', included: false },
    ],
    cta: 'Choisir ce plan',
    highlighted: false,
  },
  {
    id: 'scale',
    name: 'Scale',
    price: '29 €',
    period: 'mois',
    description: 'Pour les équipes qui gèrent plusieurs boîtes email.',
    messagesLimit: 50,
    features: [
      { text: '50 messages / mois', included: true },
      { text: '3 boîtes email connectées', included: true },
      { text: 'Réponses en 3 secondes', included: true },
      { text: 'Support prioritaire', included: true },
      { text: 'Multi-comptes', included: true },
      { text: 'Priorité de traitement', included: true },
    ],
    cta: 'Choisir ce plan',
    highlighted: true,
    badge: 'Recommandé',
  },
  {
    id: 'team',
    name: 'Team',
    price: '79 €',
    period: 'mois',
    description: 'Pour les équipes qui veulent internaliser la gestion email.',
    messagesLimit: 100,
    features: [
      { text: '100 messages / mois', included: true },
      { text: 'Boîtes email illimitées', included: true },
      { text: 'Réponses en 1 seconde', included: true },
      { text: 'Support dédié', included: true },
      { text: 'API access', included: true },
      { text: 'Multi-comptes', included: true },
    ],
    cta: 'Choisir ce plan',
    highlighted: false,
  },
]

export function Pricing() {
  const [checkoutState, setCheckoutState] = useState<CheckoutState>({
    status: 'idle',
    planId: null,
    errorMessage: null,
  })

  async function handleSelectPlan(planId: StripePlanId) {
    if (checkoutState.status === 'loading') return

    setCheckoutState({ status: 'loading', planId, errorMessage: null })

    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Échec de la création du checkout')
      }

      window.location.href = data.checkoutUrl
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Une erreur est survenue'
      setCheckoutState({ status: 'error', planId, errorMessage: message })
    }
  }

  return (
    <section
      id="pricing"
      className="py-24 px-6"
      style={{ backgroundColor: 'var(--surface)' }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-4"
          >
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest"
              style={{
                backgroundColor: 'var(--accent-light)',
                color: 'var(--accent)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: 'var(--accent)' }}
              />
              Tarifs
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4"
            style={{ color: 'var(--text)', letterSpacing: '-0.025em' }}
          >
            Un tarif adapté à ton rythme
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="text-base max-w-md mx-auto"
            style={{ color: 'var(--text-2)', lineHeight: 1.65 }}
          >
            Commence gratuitement. Passe à un plan payant quand tu ne peux plus
            t&apos;en passer.
          </motion.p>
        </div>

        {/* Error banner — global, above cards */}
        {checkoutState.status === 'error' && checkoutState.errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-start gap-3 px-4 py-3 rounded-lg max-w-2xl mx-auto"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--red) 8%, transparent)',
              border: '1px solid color-mix(in srgb, var(--red) 20%, transparent)',
            }}
          >
            <AlertCircle
              size={16}
              className="shrink-0 mt-0.5"
              style={{ color: 'var(--red)' }}
            />
            <div className="flex-1 min-w-0">
              <p
                className="text-sm"
                style={{ color: 'var(--red)' }}
              >
                {checkoutState.errorMessage}
              </p>
            </div>
            <button
              onClick={() =>
                setCheckoutState({ status: 'idle', planId: null, errorMessage: null })
              }
              className="shrink-0 w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/[0.06] transition-colors duration-150"
              style={{ color: 'var(--text-3)' }}
              aria-label="Fermer"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}

        {/* Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start"
        >
          {plans.map((plan) => {
            const isLoading =
              checkoutState.status === 'loading' &&
              checkoutState.planId === plan.id
            const hasError =
              checkoutState.status === 'error' &&
              checkoutState.planId === plan.id

            return (
              <motion.div
                key={plan.id}
                variants={cardVariants}
                className="relative rounded-xl p-8 flex flex-col gap-6"
                style={
                  plan.highlighted
                    ? {
                        backgroundColor: 'var(--bg)',
                        border: '2px solid var(--accent)',
                        boxShadow:
                          '0 20px 60px rgba(59, 130, 246, 0.12), 0 0 40px rgba(59, 130, 246, 0.06)',
                      }
                    : {
                        backgroundColor: 'var(--bg)',
                        border: '1px solid var(--border)',
                        boxShadow:
                          '0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.03)',
                      }
                }
              >
                {/* Top accent line for highlighted */}
                {plan.highlighted && (
                  <div
                    className="absolute top-0 left-[15%] right-[15%] h-[3px] rounded-b-full"
                    style={{
                      background:
                        'linear-gradient(90deg, transparent, var(--accent), transparent)',
                    }}
                  />
                )}

                {/* Badge */}
                {plan.badge && (
                  <div className="flex justify-center">
                    <span
                      className="inline-flex px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest"
                      style={{
                        background: `linear-gradient(135deg, var(--accent), var(--accent-hi))`,
                        color: '#fff',
                      }}
                    >
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Plan name + description */}
                <div>
                  <p
                    className="text-lg font-semibold tracking-tight mb-1"
                    style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}
                  >
                    {plan.name}
                  </p>
                  <p
                    className="text-sm mb-4"
                    style={{ color: 'var(--text-2)', lineHeight: 1.6 }}
                  >
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="flex items-baseline gap-1.5 mb-1">
                    <span
                      className="text-4xl font-bold tracking-tight"
                      style={{
                        color: plan.highlighted
                          ? 'var(--accent)'
                          : 'var(--text)',
                        letterSpacing: '-0.04em',
                      }}
                    >
                      {plan.price}
                    </span>
                    <span
                      className="text-sm"
                      style={{ color: 'var(--text-3)' }}
                    >
                      / {plan.period}
                    </span>
                  </div>
                  <p
                    className="text-xs"
                    style={{ color: 'var(--text-3)' }}
                  >
                    {plan.messagesLimit} messages / mois
                  </p>
                </div>

                {/* Divider */}
                <div
                  className="h-px w-full"
                  style={{ backgroundColor: 'var(--border)' }}
                />

                {/* Features */}
                <ul className="flex flex-col gap-3 flex-1">
                  {plan.features.map((feature, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-3 text-sm"
                      style={{
                        color: feature.included
                          ? 'var(--text-2)'
                          : 'var(--text-3)',
                      }}
                    >
                      {feature.included ? (
                        <Check
                          size={16}
                          className="mt-0.5 flex-shrink-0"
                          strokeWidth={2}
                          style={{ color: 'var(--accent)' }}
                        />
                      ) : (
                        <X
                          size={16}
                          className="mt-0.5 flex-shrink-0"
                          strokeWidth={2}
                          style={{ color: 'var(--text-3)' }}
                        />
                      )}
                      {feature.text}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  className="w-full h-11 rounded-xl text-sm font-medium transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={
                    plan.highlighted
                      ? {
                          backgroundColor: isLoading
                            ? 'var(--accent-hi)'
                            : 'var(--accent)',
                          color: '#fff',
                          boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
                        }
                      : {
                          backgroundColor: 'transparent',
                          color: 'var(--text-2)',
                          border: hasError
                            ? '1px solid var(--red)'
                            : '1px solid var(--border-md)',
                        }
                  }
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isLoading}
                  onMouseEnter={(e) => {
                    const btn = e.currentTarget as HTMLButtonElement
                    if (plan.highlighted && !isLoading) {
                      btn.style.backgroundColor = 'var(--accent-hi)'
                      btn.style.transform = 'translateY(-1px)'
                    } else if (!plan.highlighted && !isLoading) {
                      btn.style.borderColor = 'var(--accent)'
                      btn.style.color = 'var(--accent)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    const btn = e.currentTarget as HTMLButtonElement
                    if (plan.highlighted) {
                      btn.style.backgroundColor = 'var(--accent)'
                      btn.style.transform = ''
                    } else {
                      btn.style.borderColor = hasError ? 'var(--red)' : 'var(--border-md)'
                      btn.style.color = 'var(--text-2)'
                    }
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2
                        size={15}
                        className="animate-spin shrink-0"
                      />
                      <span>Redirection...</span>
                    </>
                  ) : hasError ? (
                    <>
                      <AlertCircle size={15} className="shrink-0" />
                      <span>Réessayer</span>
                    </>
                  ) : (
                    plan.cta
                  )}
                </button>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
