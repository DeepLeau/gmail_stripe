'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, type Variants } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { PLANS, type PlanConfig } from '@/lib/data'

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
  const router = useRouter()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  function dismissError() {
    setErrorMsg(null)
  }

  async function handlePlanClick(plan: PlanConfig) {
    setLoadingPlan(plan.slug)
    setErrorMsg(null)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: plan.slug }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Une erreur est survenue')
      }

      const { url } = await res.json()
      if (url) {
        window.location.href = url
      } else {
        throw new Error('URL de paiement introuvable')
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Une erreur est survenue')
      setLoadingPlan(null)
      setTimeout(dismissError, 3000)
    }
  }

  function handleFreePlan() {
    router.push('/signup')
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

        {/* Error banner */}
        {errorMsg && (
          <div className="mb-6 text-center">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--red) 10%, transparent)',
                color: 'var(--red)',
                border: '1px solid color-mix(in srgb, var(--red) 25%, transparent)',
              }}
            >
              <span>{errorMsg}</span>
              <button
                onClick={dismissError}
                className="ml-2 underline hover:no-underline"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>
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
          {PLANS.map((plan) => {
            const isLoading = loadingPlan === plan.slug
            const isHighlighted = plan.slug === 'scale'

            return (
              <motion.div
                key={plan.slug}
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
                {/* Top accent line for highlighted */}
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
                        background: 'linear-gradient(135deg, var(--accent), var(--violet))',
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
                    {plan.name}
                  </p>
                  <p
                    className="text-sm mb-4"
                    style={{ color: 'var(--text-2)', lineHeight: 1.6 }}
                  >
                    {plan.messagesLabel}
                  </p>

                  {/* Price */}
                  <div className="flex items-baseline gap-1.5 mb-4">
                    <span
                      className="text-4xl font-bold tracking-tight"
                      style={{
                        color: isHighlighted ? 'var(--accent)' : 'var(--text)',
                        letterSpacing: '-0.04em',
                      }}
                    >
                      {plan.priceLabel}
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
                  <li
                    className="flex items-start gap-3 text-sm"
                    style={{ color: 'var(--text-2)' }}
                  >
                    <Check
                      size={16}
                      className="mt-0.5 flex-shrink-0"
                      strokeWidth={2}
                      style={{ color: 'var(--accent)' }}
                    />
                    {plan.messagesLabel}
                  </li>
                  <li
                    className="flex items-start gap-3 text-sm"
                    style={{ color: 'var(--text-2)' }}
                  >
                    <Check
                      size={16}
                      className="mt-0.5 flex-shrink-0"
                      strokeWidth={2}
                      style={{ color: 'var(--accent)' }}
                    />
                    Accès prioritaire
                  </li>
                  <li
                    className="flex items-start gap-3 text-sm"
                    style={{ color: 'var(--text-2)' }}
                  >
                    <Check
                      size={16}
                      className="mt-0.5 flex-shrink-0"
                      strokeWidth={2}
                      style={{ color: 'var(--accent)' }}
                    />
                    Support par email
                  </li>
                  {plan.slug === 'scale' || plan.slug === 'team' ? (
                    <li
                      className="flex items-start gap-3 text-sm"
                      style={{ color: 'var(--text-2)' }}
                    >
                      <Check
                        size={16}
                        className="mt-0.5 flex-shrink-0"
                        strokeWidth={2}
                        style={{ color: 'var(--accent)' }}
                      />
                      Multi-comptes email
                    </li>
                  ) : (
                    <li
                      className="flex items-start gap-3 text-sm"
                      style={{ color: 'var(--text-3)' }}
                    >
                      <X
                        size={16}
                        className="mt-0.5 flex-shrink-0"
                        strokeWidth={2}
                        style={{ color: 'var(--text-3)' }}
                      />
                      Multi-comptes email
                    </li>
                  )}
                  {plan.slug === 'team' ? (
                    <>
                      <li
                        className="flex items-start gap-3 text-sm"
                        style={{ color: 'var(--text-2)' }}
                      >
                        <Check
                          size={16}
                          className="mt-0.5 flex-shrink-0"
                          strokeWidth={2}
                          style={{ color: 'var(--accent)' }}
                        />
                        Équipe partagée
                      </li>
                      <li
                        className="flex items-start gap-3 text-sm"
                        style={{ color: 'var(--text-2)' }}
                      >
                        <Check
                          size={16}
                          className="mt-0.5 flex-shrink-0"
                          strokeWidth={2}
                          style={{ color: 'var(--accent)' }}
                        />
                        Support prioritaire
                      </li>
                    </>
                  ) : (
                    <>
                      <li
                        className="flex items-start gap-3 text-sm"
                        style={{ color: 'var(--text-3)' }}
                      >
                        <X
                          size={16}
                          className="mt-0.5 flex-shrink-0"
                          strokeWidth={2}
                          style={{ color: 'var(--text-3)' }}
                        />
                        Équipe partagée
                      </li>
                      <li
                        className="flex items-start gap-3 text-sm"
                        style={{ color: 'var(--text-3)' }}
                      >
                        <X
                          size={16}
                          className="mt-0.5 flex-shrink-0"
                          strokeWidth={2}
                          style={{ color: 'var(--text-3)' }}
                        />
                        Support prioritaire
                      </li>
                    </>
                  )}
                </ul>

                {/* CTA */}
                <button
                  className="w-full h-11 rounded-xl text-sm font-medium transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
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
                  disabled={isLoading}
                  onClick={() => handlePlanClick(plan)}
                  onMouseEnter={(e) => {
                    if (isHighlighted && !isLoading) {
                      ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
                        'var(--accent-hi)'
                      ;(e.currentTarget as HTMLButtonElement).style.transform =
                        'translateY(-1px)'
                    } else if (!isLoading) {
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
                      <span
                        className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
                        style={{ opacity: 0.7 }}
                      />
                      <span>Redirection...</span>
                    </>
                  ) : (
                    <span>Choisir {plan.name}</span>
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
