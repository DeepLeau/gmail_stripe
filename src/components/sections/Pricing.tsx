'use client'

import { useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { Check, X, Loader2 } from 'lucide-react'
import { isValidPlan, type StripePlanName } from '@/lib/stripe/config'

type FeatureItem = {
  text: string
  included: boolean
}

type PlanItem = {
  name: string
  planKey: StripePlanName
  price: string
  period: string
  description: string
  features: FeatureItem[]
  cta: string
  highlighted: boolean
  badge?: string
}

const PLANS: PlanItem[] = [
  {
    name: 'Start',
    planKey: 'start',
    price: '9',
    period: 'mois',
    description: 'Pour les freelancers et indépendants qui veulent un assistant email.',
    features: [
      { text: '50 questions / mois', included: true },
      { text: '1 boîte email connectée', included: true },
      { text: 'Résumés de threads', included: true },
      { text: 'Recherche en langage naturel', included: true },
      { text: 'Multi-comptes', included: false },
      { text: 'Priorité de traitement', included: false },
    ],
    cta: 'Commenencer avec Start',
    highlighted: false,
  },
  {
    name: 'Scale',
    planKey: 'scale',
    price: '29',
    period: 'mois',
    description: 'Pour les professionnels qui gèrent plusieurs boîtes email.',
    features: [
      { text: '200 questions / mois', included: true },
      { text: 'Plusieurs boîtes mail', included: true },
      { text: 'Résumés de threads', included: true },
      { text: 'Recherche en langage naturel', included: true },
      { text: 'Multi-comptes', included: true },
      { text: 'Priorité de traitement', included: true },
    ],
    cta: 'Passer à Scale',
    highlighted: true,
    badge: 'Recommandé',
  },
  {
    name: 'Team',
    planKey: 'team',
    price: '79',
    period: 'mois',
    description: 'Pour les équipes qui veulent un assistant email partagé.',
    features: [
      { text: '1 000 questions / mois', included: true },
      { text: 'Boîtes email illimitées', included: true },
      { text: 'Résumés de threads', included: true },
      { text: 'Recherche en langage naturel', included: true },
      { text: 'Multi-comptes', included: true },
      { text: 'Priorité de traitement', included: true },
    ],
    cta: 'Passer à Team',
    highlighted: false,
  },
]

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

type LoadingPlan = string | null

export function Pricing() {
  const [loadingPlan, setLoadingPlan] = useState<LoadingPlan>(null)

  async function handlePlanSelect(planKey: string) {
    if (!isValidPlan(planKey)) return
    if (loadingPlan) return
    setLoadingPlan(planKey)

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      })

      const data = await res.json()

      if (!res.ok) {
        console.error('[Pricing] Checkout error:', data.error)
        setLoadingPlan(null)
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error('[Pricing] Checkout fetch error:', err)
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
            Commence gratuitement. Passe à Scale quand tu ne peux plus t&apos;en passer.
          </motion.p>
        </div>

        {/* Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start"
        >
          {PLANS.map((plan) => {
            const isLoading = loadingPlan === plan.planKey

            return (
              <motion.div
                key={plan.planKey}
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
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.03)',
                      }
                }
              >
                {/* Top accent line for Scale */}
                {plan.highlighted && (
                  <div
                    className="absolute top-0 left-[15%] right-[15%] h-[3px] rounded-b-full"
                    style={{
                      background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
                    }}
                  />
                )}

                {/* Badge */}
                {plan.badge && (
                  <div className="flex justify-center">
                    <span
                      className="inline-flex px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest"
                      style={{
                        background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
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
                  <div className="flex items-baseline gap-1.5 mb-4">
                    <span
                      className="text-4xl font-bold tracking-tight"
                      style={{
                        color: plan.highlighted ? 'var(--accent)' : 'var(--text)',
                        letterSpacing: '-0.04em',
                      }}
                    >
                      {plan.price}
                      <span
                        className="text-lg font-medium"
                        style={{ color: 'var(--text-2)' }}
                      >
                        {' '}
                        €
                      </span>
                    </span>
                    <span className="text-sm" style={{ color: 'var(--text-3)' }}>
                      / {plan.period}
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px w-full" style={{ backgroundColor: 'var(--border)' }} />

                {/* Features */}
                <ul className="flex flex-col gap-3 flex-1">
                  {plan.features.map((feature: FeatureItem, j: number) => (
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

                {/* CTA */}
                <button
                  onClick={() => handlePlanSelect(plan.planKey)}
                  disabled={isLoading}
                  className="w-full h-11 rounded-xl text-sm font-medium transition-all duration-150 flex items-center justify-center gap-2"
                  style={
                    plan.highlighted
                      ? {
                          backgroundColor: isLoading ? 'var(--accent-hi)' : 'var(--accent)',
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
                    if (isLoading) return
                    const btn = e.currentTarget as HTMLButtonElement
                    if (plan.highlighted) {
                      btn.style.backgroundColor = 'var(--accent-hi)'
                      btn.style.transform = 'translateY(-1px)'
                    } else {
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
                      btn.style.borderColor = 'var(--border-md)'
                      btn.style.color = 'var(--text-2)'
                    }
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={15} className="animate-spin shrink-0" />
                      <span>Redirection...</span>
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
