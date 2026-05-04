'use client'

import { useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { PLAN_LIST, UNIT_LABEL } from '@/lib/stripe/config'
import { createCheckoutSession } from '@/app/actions/stripe'

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

// Build features for each plan from PLAN_LIST
function buildFeatures(planId: string): { text: string; included: boolean }[] {
  const allFeatures = [
    { text: `${PLAN_LIST.start.limit} ${UNIT_LABEL}s / mois`, included: true },
    { text: '1 boîte email connectée', included: true },
    { text: 'Résumés de threads', included: true },
    { text: 'Recherche en langage naturel', included: true },
    { text: 'Multi-comptes', included: false },
    { text: 'Priorité de traitement', included: false },
  ]

  if (planId === 'start') return allFeatures.slice(0, 4)

  if (planId === 'scale') {
    return [
      { text: `${PLAN_LIST.scale.limit} ${UNIT_LABEL}s / mois`, included: true },
      { text: 'Boîtes email illimitées', included: true },
      { text: 'Résumés de threads', included: true },
      { text: 'Recherche en langage naturel', included: true },
      { text: 'Multi-comptes', included: true },
      { text: 'Priorité de traitement', included: false },
    ]
  }

  if (planId === 'team') {
    return [
      { text: `${PLAN_LIST.team.limit} ${UNIT_LABEL}s / mois`, included: true },
      { text: 'Boîtes email illimitées', included: true },
      { text: 'Résumés de threads', included: true },
      { text: 'Recherche en langage naturel', included: true },
      { text: 'Multi-comptes', included: true },
      { text: 'Priorité de traitement', included: true },
    ]
  }

  return allFeatures
}

interface PlanCardData {
  id: string
  name: string
  price: string
  period: string
  description: string
  features: { text: string; included: boolean }[]
  cta: string
  highlighted: boolean
  badge?: string
}

const PLANS: PlanCardData[] = [
  {
    id: 'start',
    name: PLAN_LIST.start.display_name,
    price: `${PLAN_LIST.start.price_cents / 100} €`,
    period: 'mois',
    description: 'Pour découvrir Emind sans engagement.',
    features: buildFeatures('start'),
    cta: 'Choisir Start',
    highlighted: false,
  },
  {
    id: 'scale',
    name: PLAN_LIST.scale.display_name,
    price: `${PLAN_LIST.scale.price_cents / 100} €`,
    period: 'mois',
    description: 'Pour les professionnels qui gèrent plusieurs boîtes email.',
    features: buildFeatures('scale'),
    cta: 'Choisir Scale',
    highlighted: true,
    badge: 'Recommandé',
  },
  {
    id: 'team',
    name: PLAN_LIST.team.display_name,
    price: `${PLAN_LIST.team.price_cents / 100} €`,
    period: 'mois',
    description: 'Pour les équipes qui vivent dans leurs emails.',
    features: buildFeatures('team'),
    cta: 'Choisir Team',
    highlighted: false,
  },
]

export function Pricing() {
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null)
  const [errorPlanId, setErrorPlanId] = useState<string | null>(null)

  async function handleCheckout(planId: string) {
    setLoadingPlanId(planId)
    setErrorPlanId(null)
    try {
      const result = await createCheckoutSession(planId)
      if (result.url) {
        window.location.href = result.url
      } else {
        setErrorPlanId(planId)
      }
    } catch {
      setErrorPlanId(planId)
    } finally {
      setLoadingPlanId(null)
    }
  }

  return (
    <section
      id="pricing"
      className="py-24 px-6"
      style={{ backgroundColor: 'var(--surface)' }}
    >
      <div className="max-w-4xl mx-auto">
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
            Commence gratuitement. Passe à l&apos;offre qui te correspond.
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
          {PLANS.map((plan) => (
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
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.03)',
                    }
              }
            >
              {/* Top accent line for highlighted plan */}
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
                      background: `linear-gradient(135deg, var(--accent), var(--violet))`,
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
                    style={{ color: plan.highlighted ? 'var(--accent)' : 'var(--text)', letterSpacing: '-0.04em' }}
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
              <div className="flex flex-col gap-2">
                <button
                  className="w-full h-11 rounded-xl text-sm font-medium transition-all duration-150 flex items-center justify-center gap-2"
                  style={
                    plan.highlighted
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
                    if (plan.highlighted) {
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
                    if (plan.highlighted) {
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
                  onClick={() => handleCheckout(plan.id)}
                  disabled={loadingPlanId !== null}
                >
                  {loadingPlanId === plan.id ? (
                    <>
                      <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                      Redirection...
                    </>
                  ) : (
                    plan.cta
                  )}
                </button>

                {/* Inline error message */}
                {errorPlanId === plan.id && (
                  <p className="text-xs text-center" style={{ color: 'var(--red)' }}>
                    Une erreur est survenue, veuillez réessayer.
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
