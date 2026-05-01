'use client'

import { useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { Check, X, Loader2 } from 'lucide-react'

interface PlanConfig {
  id: string
  name: string
  price: string
  limit: number | null
  unitLabel: string
  unitLabelPlural: string
  description: string
  features: { text: string; included: boolean }[]
  cta: string
  href?: string
  highlighted?: boolean
  badge?: string
}

const PLANS: PlanConfig[] = [
  {
    id: 'free',
    name: 'Free',
    price: '0 €',
    limit: 0,
    unitLabel: 'message',
    unitLabelPlural: 'messages',
    description: 'Pour découvrir Emind sans engagement.',
    features: [
      { text: '10 messages / mois', included: true },
      { text: '1 boîte mail connectée', included: true },
      { text: 'Résumés de threads', included: true },
      { text: 'Recherche en langage naturel', included: true },
      { text: 'Multi-comptes', included: false },
      { text: 'Priorité de traitement', included: false },
    ],
    cta: 'Commencer gratuitement',
    href: '/signup',
    highlighted: false,
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '9 €',
    limit: 50,
    unitLabel: 'message',
    unitLabelPlural: 'messages',
    description: 'Pour les utilisateurs réguliers qui veulent plus.',
    features: [
      { text: '50 messages / mois', included: true },
      { text: '1 boîte mail connectée', included: true },
      { text: 'Résumés de threads', included: true },
      { text: 'Recherche en langage naturel', included: true },
      { text: 'Multi-comptes', included: false },
      { text: 'Priorité de traitement', included: false },
    ],
    cta: 'Passer à Starter',
    highlighted: false,
  },
  {
    id: 'growth',
    name: 'Growth',
    price: '29 €',
    limit: 200,
    unitLabel: 'message',
    unitLabelPlural: 'messages',
    description: 'Pour les professionnels qui vivent dans leurs emails.',
    features: [
      { text: '200 messages / mois', included: true },
      { text: 'Plusieurs boîtes mail', included: true },
      { text: 'Résumés de threads', included: true },
      { text: 'Recherche en langage naturel', included: true },
      { text: 'Multi-comptes', included: true },
      { text: 'Priorité de traitement', included: false },
    ],
    cta: 'Passer à Growth',
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '79 €',
    limit: 1000,
    unitLabel: 'message',
    unitLabelPlural: 'messages',
    description: 'Pour les power users qui ne peuvent plus s\'en passer.',
    features: [
      { text: '1000 messages / mois', included: true },
      { text: 'Plusieurs boîtes mail', included: true },
      { text: 'Résumés de threads', included: true },
      { text: 'Recherche en langage naturel', included: true },
      { text: 'Multi-comptes', included: true },
      { text: 'Priorité de traitement', included: true },
    ],
    cta: 'Passer à Pro',
    highlighted: true,
    badge: 'Recommandé',
  },
]

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

export function Pricing() {
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleCheckout(planId: string) {
    if (planId === 'free') return
    setLoadingPlanId(planId)
    setError(null)

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Erreur lors de la création du checkout')
      }

      const { url } = await res.json()
      if (url) window.location.href = url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
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
            Commence gratuitement. Passe à un plan supérieur quand tu ne peux plus t&apos;en passer.
          </motion.p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 text-center text-sm text-red-600 px-4 py-2 rounded-lg bg-red-50 border border-red-200 max-w-md mx-auto">
            {error}
          </div>
        )}

        {/* Cards grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-5 items-start"
        >
          {PLANS.map((plan) => {
            const isLoading = loadingPlanId === plan.id

            return (
              <motion.div
                key={plan.id}
                variants={cardVariants}
                className="relative rounded-xl p-6 flex flex-col gap-5"
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
                {plan.highlighted && (
                  <div
                    className="absolute top-0 left-[15%] right-[15%] h-[3px] rounded-b-full"
                    style={{
                      background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
                    }}
                  />
                )}

                {plan.badge && (
                  <div className="flex justify-center">
                    <span
                      className="inline-flex px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest"
                      style={{
                        background: 'linear-gradient(135deg, var(--accent), var(--violet))',
                        color: '#fff',
                      }}
                    >
                      {plan.badge}
                    </span>
                  </div>
                )}

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

                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span
                      className="text-4xl font-bold tracking-tight"
                      style={{
                        color: plan.highlighted ? 'var(--accent)' : 'var(--text)',
                        letterSpacing: '-0.04em',
                      }}
                    >
                      {plan.price}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--text-3)' }}>
                      / mois
                    </span>
                  </div>

                  {plan.limit !== null && plan.limit > 0 && (
                    <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                      {plan.limit} {plan.limit === 1 ? plan.unitLabel : plan.unitLabelPlural} / mois
                    </p>
                  )}
                </div>

                <div className="h-px w-full" style={{ backgroundColor: 'var(--border)' }} />

                <ul className="flex flex-col gap-2.5 flex-1">
                  {plan.features.map((feature, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-2.5 text-sm"
                      style={{
                        color: feature.included ? 'var(--text-2)' : 'var(--text-3)',
                      }}
                    >
                      {feature.included ? (
                        <Check
                          size={14}
                          className="mt-0.5 flex-shrink-0"
                          strokeWidth={2}
                          style={{ color: 'var(--accent)' }}
                        />
                      ) : (
                        <X
                          size={14}
                          className="mt-0.5 flex-shrink-0"
                          strokeWidth={2}
                          style={{ color: 'var(--text-3)' }}
                        />
                      )}
                      {feature.text}
                    </li>
                  ))}
                </ul>

                {plan.href ? (
                  <a
                    href={plan.href}
                    className="w-full h-11 rounded-xl text-sm font-medium transition-all duration-150 flex items-center justify-center"
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
                        ;(e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--accent-hi)'
                        ;(e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)'
                      } else {
                        ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--accent)'
                        ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (plan.highlighted) {
                        ;(e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--accent)'
                        ;(e.currentTarget as HTMLAnchorElement).style.transform = ''
                      } else {
                        ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border-md)'
                        ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-2)'
                      }
                    }}
                  >
                    {plan.cta}
                  </a>
                ) : (
                  <button
                    onClick={() => handleCheckout(plan.id)}
                    disabled={isLoading}
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
                        ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent-hi)'
                        ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'
                      } else {
                        ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)'
                        ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (plan.highlighted) {
                        ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent)'
                        ;(e.currentTarget as HTMLButtonElement).style.transform = ''
                      } else {
                        ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-md)'
                        ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-2)'
                      }
                    }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={14} className="animate-spin shrink-0" />
                        <span>Redirection en cours...</span>
                      </>
                    ) : (
                      plan.cta
                    )}
                  </button>
                )}
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
