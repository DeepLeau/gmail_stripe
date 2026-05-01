'use client'

import { useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { getAllPlans, type StripePlanName } from '@/lib/stripe/config'
import { UNIT_LABEL_PLURAL } from '@/lib/stripe/config'

const plans = getAllPlans()

// Format label limite de messages
function formatUnitLabel(unitsLimit: number): string {
  return `${unitsLimit} ${UNIT_LABEL_PLURAL}/mois`
}

// Features affichées pour chaque plan
const FEATURES: Record<StripePlanName, Array<{ text: string; included: boolean }>> = {
  starter: [
    { text: '50 messages/mois', included: true },
    { text: '1 boîte email', included: true },
    { text: 'Résumés de threads', included: true },
    { text: 'Recherche en langage naturel', included: true },
    { text: 'Multi-comptes', included: false },
    { text: 'Priorité de traitement', included: false },
  ],
  growth: [
    { text: '200 messages/mois', included: true },
    { text: 'Boîtes email multiples', included: true },
    { text: 'Résumés de threads', included: true },
    { text: 'Recherche en langage naturel', included: true },
    { text: 'Multi-comptes', included: false },
    { text: 'Priorité de traitement', included: true },
  ],
  pro: [
    { text: '1000 messages/mois', included: true },
    { text: 'Boîtes email illimitées', included: true },
    { text: 'Résumés de threads', included: true },
    { text: 'Recherche en langage naturel', included: true },
    { text: 'Multi-comptes', included: true },
    { text: 'Priorité de traitement', included: true },
  ],
}

// Plans mis en avant (Growth = recommandé)
const HIGHLIGHTED: StripePlanName[] = ['growth']

// Badges
const BADGE: Partial<Record<StripePlanName, string>> = {
  growth: 'Recommandé',
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

export function Pricing() {
  const [loadingKey, setLoadingKey] = useState<StripePlanName | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleCheckout(planKey: StripePlanName) {
    setLoadingKey(planKey)
    setErrorMessage(null)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Erreur lors de la création du checkout')
      }
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Une erreur est survenue')
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
            Commence gratuitement. Passe à Pro quand tu ne peux plus t&apos;en passer.
          </motion.p>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mb-6 text-sm text-center text-[var(--red)] px-4 py-2 rounded-lg bg-[var(--red)]/5 border border-[var(--red)]/15">
            {errorMessage}
          </div>
        )}

        {/* Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start"
        >
          {plans.map((plan) => {
            const isLoading = loadingKey === plan.id
            const isHighlighted = HIGHLIGHTED.includes(plan.id)
            const features = FEATURES[plan.id]

            return (
              <motion.div
                key={plan.id}
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
                {BADGE[plan.id] && (
                  <div className="flex justify-center">
                    <span
                      className="inline-flex px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest"
                      style={{
                        background: `linear-gradient(135deg, var(--accent), var(--violet))`,
                        color: '#fff',
                      }}
                    >
                      {BADGE[plan.id]}
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
                    {plan.id === 'starter' && 'Pour découvrir Emind sans engagement.'}
                    {plan.id === 'growth' && 'Pour les professionnels qui gèrent plusieurs boîtes email.'}
                    {plan.id === 'pro' && 'Pour les power users qui ne veulent aucune limite.'}
                  </p>

                  {/* Units limit */}
                  <p
                    className="text-xs mb-3"
                    style={{ color: 'var(--text-3)' }}
                  >
                    {formatUnitLabel(plan.unitsLimit)}
                  </p>
                </div>

                {/* Divider */}
                <div
                  className="h-px w-full"
                  style={{ backgroundColor: 'var(--border)' }}
                />

                {/* Features */}
                <ul className="flex flex-col gap-3 flex-1">
                  {features.map((feature, j) => (
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
                  disabled={isLoading}
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
                  onClick={() => handleCheckout(plan.id)}
                >
                  {isLoading ? (
                    <span className="animate-pulse">Redirection...</span>
                  ) : (
                    isHighlighted ? 'Passer à ' + plan.displayName : 'Choisir ' + plan.displayName
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
