'use client'

import { motion, type Variants } from 'framer-motion'
import { Check, X, Loader2 } from 'lucide-react'
import { createCheckoutSessionAction } from '@/app/actions/stripe'

const plans = [
  {
    key: 'start',
    name: 'Start',
    price: '9 €',
    period: 'mois',
    description: 'Pour commencer à exploiter tes emails avec l\'IA.',
    features: [
      { text: '10 questions / mois', included: true },
      { text: '1 boîte mail connectée', included: true },
      { text: 'Résumés de threads', included: true },
      { text: 'Recherche en langage naturel', included: true },
      { text: 'Multi-comptes', included: false },
      { text: 'Priorité de traitement', included: false },
    ],
    cta: 'Commencer avec Start',
    highlighted: false,
  },
  {
    key: 'scale',
    name: 'Scale',
    price: '29 €',
    period: 'mois',
    description: 'Pour les équipes qui vivent dans leurs emails.',
    features: [
      { text: '50 questions / mois', included: true },
      { text: 'Plusieurs boîtes mail', included: true },
      { text: 'Résumés de threads', included: true },
      { text: 'Recherche en langage naturel', included: true },
      { text: 'Multi-comptes', included: true },
      { text: 'Priorité de traitement', included: false },
    ],
    cta: 'Passer à Scale',
    highlighted: true,
    badge: 'Recommandé',
  },
  {
    key: 'team',
    name: 'Team',
    price: '49 €',
    period: 'mois',
    description: 'Pour les équipes qui ne peuvent plus s\'en passer.',
    features: [
      { text: '100 questions / mois', included: true },
      { text: 'Plusieurs boîtes mail', included: true },
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

export function Pricing() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [loadingKey, setLoadingKey] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  async function handleCheckout(planKey: string) {
    setLoadingKey(planKey)
    setError(null)
    try {
      const result = await createCheckoutSessionAction(planKey)
      if (result?.url) {
        window.location.href = result.url
      } else {
        throw new Error('Aucune URL de checkout retournée')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoadingKey(null)
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
            Commence gratuitement. Passe à un plan payant quand tu ne peux plus t&apos;en passer.
          </motion.p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 text-center">
            <p className="text-sm text-[var(--red)] py-2 px-4 rounded-lg bg-[var(--red)]/5 border border-[var(--red)]/15">
              {error}
            </p>
          </div>
        )}

        {/* Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.key}
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
                      background: 'linear-gradient(135deg, var(--accent), var(--violet))',
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
                onClick={() => handleCheckout(plan.key)}
                disabled={loadingKey !== null}
              >
                {loadingKey === plan.key ? (
                  <>
                    <Loader2 size={15} className="animate-spin shrink-0" />
                    <span>Redirection...</span>
                  </>
                ) : (
                  plan.cta
                )}
              </button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// Need React for useState — add import
import React from 'react'
