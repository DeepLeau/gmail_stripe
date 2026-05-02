'use client'

import { useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { Check, Loader2 } from 'lucide-react'
import { PLAN_RECORDS, type StripePlanName } from '@/lib/stripe/config'

type LoadingState = Record<string, boolean>

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

function formatUnits(limit: number): string {
  if (limit === 0) return 'Gratuit'
  if (limit === 1) return '1 message / mois'
  if (limit >= 1000) return `${limit.toLocaleString('fr-FR')} messages / mois`
  return `${limit} messages / mois`
}

async function handlePlanCheckout(planSlug: string, setLoading: (s: LoadingState) => void) {
  setLoading({ [planSlug]: true })
  try {
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: planSlug }),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('[Pricing] Checkout error:', data.error)
      setLoading({})
      return
    }

    if (data.url) {
      window.location.href = data.url
    }
  } catch (err) {
    console.error('[Pricing] Checkout failed:', err)
    setLoading({})
  }
}

export function Pricing() {
  const [loading, setLoading] = useState<LoadingState>({})

  // Ordre d'affichage : free, starter, growth, pro — growth mis en valeur
  const displayOrder: StripePlanName[] = ['free', 'starter', 'growth', 'pro']
  const paidPlans = displayOrder.map((slug) => PLAN_RECORDS[slug])

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
            Commence gratuitement. Passe à Growth ou Pro quand tu ne peux plus t&apos;en passer.
          </motion.p>
        </div>

        {/* Cards — 3-column on small+, Growth highlighted */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-start"
        >
          {paidPlans.map((plan) => {
            const isLoading = !!loading[plan.slug]
            const isPaid = plan.slug !== 'free'

            return (
              <motion.div
                key={plan.slug}
                variants={cardVariants}
                className="relative rounded-xl p-7 flex flex-col gap-5"
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
                {/* Top accent line for highlighted */}
                {plan.highlighted && (
                  <div
                    className="absolute top-0 left-[15%] right-[15%] h-[3px] rounded-b-full"
                    style={{
                      background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
                    }}
                  />
                )}

                {/* Badge */}
                {plan.highlighted && (
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
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span
                      className="text-4xl font-bold tracking-tight"
                      style={{
                        color: plan.highlighted ? 'var(--accent)' : 'var(--text)',
                        letterSpacing: '-0.04em',
                      }}
                    >
                      {plan.priceNumeric === 0 ? 'Gratuit' : `${plan.priceNumeric} €`}
                    </span>
                    {plan.priceNumeric > 0 && (
                      <span className="text-sm" style={{ color: 'var(--text-3)' }}>
                        / mois
                      </span>
                    )}
                  </div>

                  {/* Units limit */}
                  <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                    {formatUnits(plan.unitsLimit)}
                  </p>
                </div>

                {/* Divider */}
                <div className="h-px w-full" style={{ backgroundColor: 'var(--border)' }} />

                {/* Features */}
                <ul className="flex flex-col gap-3 flex-1">
                  {plan.features.map((feature: string, j: number) => (
                    <li
                      key={j}
                      className="flex items-start gap-3 text-sm"
                      style={{ color: 'var(--text-2)' }}
                    >
                      <Check
                        size={16}
                        className="mt-0.5 flex-shrink-0"
                        strokeWidth={2}
                        style={{ color: 'var(--accent)' }}
                      />
                      {feature}
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
                      : isPaid
                        ? {
                            backgroundColor: 'transparent',
                            color: 'var(--text-2)',
                            border: '1px solid var(--border-md)',
                          }
                        : {
                            backgroundColor: 'transparent',
                            color: 'var(--text-3)',
                            border: '1px solid var(--border)',
                          }
                  }
                  disabled={isLoading}
                  onMouseEnter={(e) => {
                    const btn = e.currentTarget as HTMLButtonElement
                    if (plan.highlighted) {
                      btn.style.backgroundColor = 'var(--accent-hi)'
                      btn.style.transform = 'translateY(-1px)'
                    } else if (isPaid) {
                      btn.style.borderColor = 'var(--accent)'
                      btn.style.color = 'var(--accent)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    const btn = e.currentTarget as HTMLButtonElement
                    if (plan.highlighted) {
                      btn.style.backgroundColor = 'var(--accent)'
                      btn.style.transform = ''
                    } else if (isPaid) {
                      btn.style.borderColor = 'var(--border-md)'
                      btn.style.color = 'var(--text-2)'
                    }
                  }}
                  onClick={() => {
                    if (!isPaid) return
                    handlePlanCheckout(plan.slug, setLoading)
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
