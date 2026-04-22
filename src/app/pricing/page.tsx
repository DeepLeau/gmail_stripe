'use client'

import { motion, type Variants } from 'framer-motion'
import { Check, X, Loader2 } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

const plans = [
  {
    name: 'Free',
    price: '0 €',
    period: 'mois',
    description: 'Pour découvrir Emind sans engagement.',
    features: [
      { text: '100 questions / mois', included: true },
      { text: '1 boîte mail connectée', included: true },
      { text: 'Résumés de threads', included: true },
      { text: 'Recherche en langage naturel', included: true },
      { text: 'Multi-comptes', included: false },
      { text: 'Priorité de traitement', included: false },
    ],
    cta: 'Commencer gratuitement',
    highlighted: false,
    planKey: 'free',
  },
  {
    name: 'Pro',
    price: '19 €',
    period: 'mois',
    description: 'Pour les professionnels qui vivent dans leurs emails.',
    features: [
      { text: 'Questions illimitées', included: true },
      { text: 'Plusieurs boîtes mail', included: true },
      { text: 'Résumés de threads', included: true },
      { text: 'Recherche en langage naturel', included: true },
      { text: 'Multi-comptes', included: true },
      { text: 'Priorité de traitement', included: true },
    ],
    cta: 'Passer à Pro',
    highlighted: true,
    badge: 'Recommandé',
    planKey: 'pro',
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

export default function PricingPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [errorPlan, setErrorPlan] = useState<string | null>(null)

  async function handlePlanCTA(planKey: string) {
    if (planKey === 'free') {
      window.location.href = '/signup'
      return
    }

    setLoadingPlan(planKey)
    setErrorPlan(null)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: planKey,
          successUrl: `${window.location.origin}/success`,
          cancelUrl: `${window.location.origin}/pricing`,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Échec de la création de la session')
      }

      const { url } = await res.json()
      window.location.href = url
    } catch (err) {
      setErrorPlan(planKey)
      setLoadingPlan(null)
      console.error('[Pricing] Checkout error:', err)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--surface)' }}>
      {/* Nav minimal */}
      <header className="shrink-0 flex items-center justify-between h-14 px-6 border-b border-[var(--border)]">
        <Link
          href="/"
          className="text-sm font-semibold text-[var(--accent)] tracking-tight"
        >
          Emind
        </Link>
        <Link
          href="/chat"
          className="text-sm text-[var(--text-2)] hover:text-[var(--text)] transition-colors duration-150"
        >
          Aller au chat
        </Link>
      </header>

      {/* Pricing content */}
      <main className="flex-1 flex items-center justify-center py-24 px-6">
        <div className="max-w-4xl w-full">
          {/* Header */}
          <div className="text-center mb-14">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
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
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4"
              style={{ color: 'var(--text)', letterSpacing: '-0.025em' }}
            >
              Un tarif adapté à ton rythme
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.18 }}
              className="text-base max-w-md mx-auto"
              style={{ color: 'var(--text-2)', lineHeight: 1.65 }}
            >
              Commence gratuitement. Passe à Pro quand tu ne peux plus t&apos;en passer.
            </motion.p>
          </div>

          {/* Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start"
          >
            {plans.map((plan, i) => {
              const isLoading = loadingPlan === plan.planKey
              const hasError = errorPlan === plan.planKey

              return (
                <motion.div
                  key={i}
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
                  {/* Top accent line for Pro */}
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
                        style={{
                          color: plan.highlighted ? 'var(--accent)' : 'var(--text)',
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

                  {/* Error message inline */}
                  {hasError && (
                    <p className="text-xs text-[var(--red)] text-center">
                      Une erreur est survenue. Veuillez réessayer.
                    </p>
                  )}

                  {/* CTA */}
                  <button
                    disabled={isLoading}
                    onClick={() => handlePlanCTA(plan.planKey)}
                    className="w-full h-11 rounded-xl text-sm font-medium transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
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
                      if (plan.highlighted && !isLoading) {
                        ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
                          'var(--accent-hi)'
                        ;(e.currentTarget as HTMLButtonElement).style.transform =
                          'translateY(-1px)'
                      } else if (!plan.highlighted && !isLoading) {
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
      </main>
    </div>
  )
}
