'use client'

import { motion, type Variants } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { useState } from 'react'
import { getAllPlans, type StripePlanName } from '@/lib/stripe/config'

const plans = getAllPlans()
const TEAM_PLAN_ID = 'team' satisfies StripePlanName

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
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleCheckout(planKey: string) {
    setLoadingPlan(planKey)
    setErrorMessage(null)
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
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Une erreur est survenue')
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
            Commence gratuitement. Passe à Start, Scale ou Team quand tu ne peux plus t&apos;en passer.
          </motion.p>
        </div>

        {/* Message d'erreur réseau */}
        {errorMessage && (
          <div className="mb-6 text-center text-sm text-[var(--red)] px-4 py-2 rounded-lg bg-[var(--red)]/5 border border-[var(--red)]/15">
            {errorMessage}
          </div>
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
            const isTeam = plan.id === TEAM_PLAN_ID
            const unitLabel = plan.unitsLimit === 1 ? 'message' : 'messages'
            const isLoading = loadingPlan === plan.id

            return (
              <motion.div
                key={plan.id}
                variants={cardVariants}
                className="relative rounded-xl p-8 flex flex-col gap-6"
                style={
                  isTeam
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
                {/* Top accent line for Team */}
                {isTeam && (
                  <div
                    className="absolute top-0 left-[15%] right-[15%] h-[3px] rounded-b-full"
                    style={{
                      background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
                    }}
                  />
                )}

                {/* Badge "Le plus populaire" sur Team */}
                {isTeam && (
                  <div className="flex justify-center">
                    <span
                      className="inline-flex px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest"
                      style={{
                        background: `linear-gradient(135deg, var(--accent), var(--violet))`,
                        color: '#fff',
                      }}
                    >
                      Le plus populaire
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
                    {plan.unitsLimit} {unitLabel} par mois
                  </p>

                  {/* Price */}
                  <div className="flex items-baseline gap-1.5 mb-4">
                    <span
                      className="text-4xl font-bold tracking-tight"
                      style={{
                        color: isTeam ? 'var(--accent)' : 'var(--text)',
                        letterSpacing: '-0.04em',
                      }}
                    >
                      {plan.price} €
                    </span>
                    <span className="text-sm" style={{ color: 'var(--text-3)' }}>
                      / mois
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px w-full" style={{ backgroundColor: 'var(--border)' }} />

                {/* Features */}
                <ul className="flex flex-col gap-3 flex-1">
                  <li className="flex items-start gap-3 text-sm" style={{ color: 'var(--text-2)' }}>
                    <Check
                      size={16}
                      className="mt-0.5 flex-shrink-0"
                      strokeWidth={2}
                      style={{ color: 'var(--accent)' }}
                    />
                    {plan.unitsLimit} {unitLabel} par mois
                  </li>
                  <li className="flex items-start gap-3 text-sm" style={{ color: 'var(--text-2)' }}>
                    <Check
                      size={16}
                      className="mt-0.5 flex-shrink-0"
                      strokeWidth={2}
                      style={{ color: 'var(--accent)' }}
                    />
                    Accès prioritaire
                  </li>
                  <li className="flex items-start gap-3 text-sm" style={{ color: 'var(--text-2)' }}>
                    <Check
                      size={16}
                      className="mt-0.5 flex-shrink-0"
                      strokeWidth={2}
                      style={{ color: 'var(--accent)' }}
                    />
                    Recherche en langage naturel
                  </li>
                  {isTeam && (
                    <li className="flex items-start gap-3 text-sm" style={{ color: 'var(--text-2)' }}>
                      <Check
                        size={16}
                        className="mt-0.5 flex-shrink-0"
                        strokeWidth={2}
                        style={{ color: 'var(--accent)' }}
                      />
                      Multi-comptes email
                    </li>
                  )}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => handleCheckout(plan.id)}
                  disabled={isLoading}
                  className="w-full h-11 rounded-xl text-sm font-medium transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={
                    isTeam
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
                    if (isTeam) {
                      ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent-hi)'
                      ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'
                    } else {
                      ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)'
                      ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isTeam) {
                      ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent)'
                      ;(e.currentTarget as HTMLButtonElement).style.transform = ''
                    } else {
                      ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-md)'
                      ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-2)'
                    }
                  }}
                >
                  {isLoading ? 'Redirection...' : `Choisir ${plan.displayName}`}
                </button>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
