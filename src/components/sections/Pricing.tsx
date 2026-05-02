'use client'

import { useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { Check, X, Loader2 } from 'lucide-react'
import { STRIPE_PLANS, type StripePlanName } from '@/lib/stripe/config'

type PlanId = StripePlanName

// Prix en euros — non stockés dans Stripe config (Price IDs ≠ montants)
// À mettre à jour si les prix Stripe changent.
const PLAN_PRICES: Record<PlanId, number> = {
  starter: 9,
  growth: 29,
  pro: 79,
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

const featuresMap: Record<PlanId, { text: string; included: boolean }[]> = {
  starter: [
    { text: '50 messages / mois', included: true },
    { text: '1 boîte mail connectée', included: true },
    { text: 'Résumés de threads', included: true },
    { text: 'Recherche en langage naturel', included: true },
    { text: 'Multi-comptes', included: false },
    { text: 'Priorité de traitement', included: false },
  ],
  growth: [
    { text: '200 messages / mois', included: true },
    { text: 'Plusieurs boîtes mail', included: true },
    { text: 'Résumés de threads', included: true },
    { text: 'Recherche en langage naturel', included: true },
    { text: 'Multi-comptes', included: true },
    { text: 'Priorité de traitement', included: false },
  ],
  pro: [
    { text: '1000 messages / mois', included: true },
    { text: 'Plusieurs boîtes mail', included: true },
    { text: 'Résumés de threads', included: true },
    { text: 'Recherche en langage naturel', included: true },
    { text: 'Multi-comptes', included: true },
    { text: 'Priorité de traitement', included: true },
  ],
}

export function Pricing() {
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null)
  const [errorPlan, setErrorPlan] = useState<PlanId | null>(null)

  async function handleCheckout(planKey: PlanId) {
    setLoadingPlan(planKey)
    setErrorPlan(null)

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Erreur lors de la création du checkout')
      }

      const { url } = await res.json()
      if (url) {
        window.location.href = url
      }
    } catch (err) {
      setErrorPlan(planKey)
      console.error('Checkout error:', err)
    } finally {
      setLoadingPlan(null)
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
            Commence gratuitement. Passe à Pro quand tu ne peux plus t'en passer.
          </motion.p>
        </div>

        {/* Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start"
        >
          {(Object.keys(STRIPE_PLANS) as PlanId[]).map((planKey) => {
            const plan = STRIPE_PLANS[planKey]
            const isHighlighted = planKey === 'growth'
            const isLoading = loadingPlan === planKey
            const hasError = errorPlan === planKey
            const price = PLAN_PRICES[planKey]

            return (
              <motion.div
                key={planKey}
                variants={cardVariants}
                className="relative rounded-xl p-8 flex flex-col gap-6"
                style={
                  isHighlighted
                    ? {
                        backgroundColor: 'var(--bg)',
                        border: '2px solid var(--accent)',
                        boxShadow:
                          '0 20px 60px rgba(59, 130, 246, 0.12), 0 0 40px rgba(59, 130, 246, 0.06)',
                      }
                    : {
                        backgroundColor: 'var(--bg)',
                        border: '1px solid var(--border)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.03)',
                      }
                }
              >
                {/* Top accent line for highlighted plan */}
                {isHighlighted && (
                  <div
                    className="absolute top-0 left-[15%] right-[15%] h-[3px] rounded-b-full"
                    style={{
                      background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
                    }}
                  />
                )}

                {/* Badge */}
                {isHighlighted && (
                  <div className="flex justify-center">
                    <span
                      className="inline-flex px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest"
                      style={{
                        background: `linear-gradient(135deg, var(--accent), var(--violet))`,
                        color: '#fff',
                      }}
                    >
                      Recommandé
                    </span>
                  </div>
                )}

                {/* Plan name + description */}
                <div>
                  <p
                    className="text-lg font-semibold tracking-tight mb-1"
                    style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}
                  >
                    {plan.displayName}
                  </p>
                  <p
                    className="text-sm mb-4"
                    style={{ color: 'var(--text-2)', lineHeight: 1.6 }}
                  >
                    {planKey === 'starter' && 'Pour découvrir Emind sans engagement.'}
                    {planKey === 'growth' && 'Pour les professionnels qui vivent dans leurs emails.'}
                    {planKey === 'pro' && 'Pour les équipes qui maximisent leur productivité.'}
                  </p>

                  {/* Price */}
                  <div className="flex items-baseline gap-1.5 mb-4">
                    <span
                      className="text-4xl font-bold tracking-tight"
                      style={{ color: isHighlighted ? 'var(--accent)' : 'var(--text)', letterSpacing: '-0.04em' }}
                    >
                      {price} €
                    </span>
                    <span
                      className="text-sm"
                      style={{ color: 'var(--text-3)' }}
                    >
                      / mois
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div
                  className="h-px w-full"
                  style={{ backgroundColor: 'var(--border)' }}
                />

                {/* Features */}
                <ul className="flex flex-col gap-3 flex-1">
                  {featuresMap[planKey].map((feature, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-3 text-sm"
                      style={{
                        color: feature.included ? 'var(--text-2)' : 'var(--text-3)',
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

                {/* Error message */}
                {hasError && (
                  <p className="text-xs text-center text-red-500 py-2">
                    Une erreur est survenue. Veuillez réessayer.
                  </p>
                )}

                {/* CTA */}
                <button
                  onClick={() => handleCheckout(planKey)}
                  disabled={isLoading}
                  className="w-full h-11 rounded-xl text-sm font-medium transition-all duration-150 flex items-center justify-center gap-2"
                  style={
                    isHighlighted
                      ? {
                          backgroundColor: 'var(--accent)',
                          color: '#fff',
                          boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
                        }
                      : {
                          backgroundColor: 'transparent',
                          color: 'var(--text-2)',
                          border: '1px solid var(--border-md)',
                        }
                  }
                  onMouseEnter={(e) => {
                    if (isHighlighted) {
                      ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
                        'var(--accent-hi)'
                      ;(e.currentTarget as HTMLButtonElement).style.transform =
                        'translateY(-1px)'
                    } else {
                      ;(e.currentTarget as HTMLButtonElement).style.borderColor =
                        'var(--accent)'
                      ;(e.currentTarget as HTMLButtonElement).style.color =
                        'var(--accent)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isHighlighted) {
                      ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
                        'var(--accent)'
                      ;(e.currentTarget as HTMLButtonElement).style.transform = ''
                    } else {
                      ;(e.currentTarget as HTMLButtonElement).style.borderColor =
                        'var(--border-md)'
                      ;(e.currentTarget as HTMLButtonElement).style.color =
                        'var(--text-2)'
                    }
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={15} className="animate-spin shrink-0" />
                      <span>Redirection...</span>
                    </>
                  ) : (
                    <span>
                      {planKey === 'starter' && 'Commencer gratuitement'}
                      {planKey === 'growth' && 'Passer à Growth'}
                      {planKey === 'pro' && 'Passer à Pro'}
                    </span>
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
