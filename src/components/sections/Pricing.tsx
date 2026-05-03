'use client'

import { motion, type Variants } from 'framer-motion'
import { useState } from 'react'
import { Check, X, Loader2 } from 'lucide-react'
import type { SubscriptionData } from '@/lib/stripe/config'

type LoadingState = Record<string, 'idle' | 'loading_checkout'>

interface PlanConfig {
  id: string
  name: string
  price: string
  period: string
  description: string
  features: { text: string; included: boolean }[]
  cta: string
  highlighted: boolean
  badge?: string
  messagesLimit: number
}

const plans: PlanConfig[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: '9 €',
    period: 'mois',
    description: 'Pour découvrir Emind et automatiser vos réponses email.',
    features: [
      { text: '50 messages / mois', included: true },
      { text: '1 boîte email connectée', included: true },
      { text: 'Réponses en 10 secondes', included: true },
      { text: 'Support par email', included: true },
      { text: 'Multi-comptes', included: false },
      { text: 'Priorité de traitement', included: false },
    ],
    cta: 'Commencer avec Starter',
    highlighted: false,
    messagesLimit: 50,
  },
  {
    id: 'growth',
    name: 'Growth',
    price: '29 €',
    period: 'mois',
    description: 'Pour les professionnels qui gèrent plusieurs boîtes email.',
    features: [
      { text: '200 messages / mois', included: true },
      { text: 'Boîtes email illimitées', included: true },
      { text: 'Réponses en 5 secondes', included: true },
      { text: 'Multi-comptes', included: true },
      { text: 'Support prioritaire', included: true },
      { text: 'Historique des conversations', included: true },
    ],
    cta: 'Passer à Growth',
    highlighted: true,
    badge: 'Recommandé',
    messagesLimit: 200,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '79 €',
    period: 'mois',
    description: 'Pour les équipes qui maximisent leur productivité email.',
    features: [
      { text: '1 000 messages / mois', included: true },
      { text: 'Boîtes email illimitées', included: true },
      { text: 'Réponses en 3 secondes', included: true },
      { text: 'Multi-comptes', included: true },
      { text: 'Support prioritaire', included: true },
      { text: 'Accès anticipé aux nouvelles fonctionnalités', included: true },
    ],
    cta: 'Passer à Pro',
    highlighted: false,
    messagesLimit: 1000,
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

function setStripeEmailCookie(email: string) {
  // Cookie httpOnly visible sur le serveur (le checkout API la lira via les cookies de la requête)
  document.cookie = `stripe_email=${encodeURIComponent(email)}; path=/; max-age=86400; SameSite=Lax`
}

export function Pricing() {
  const [loadingState, setLoadingState] = useState<LoadingState>({})
  const [emailInputs, setEmailInputs] = useState<Record<string, string>>({})
  const [emailErrors, setEmailErrors] = useState<Record<string, string>>({})
  const [checkoutErrors, setCheckoutErrors] = useState<Record<string, string>>({})

  const handleCheckout = async (planKey: string) => {
    const email = emailInputs[planKey]?.trim() ?? ''
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (email && !emailRegex.test(email)) {
      setEmailErrors((prev) => ({ ...prev, [planKey]: 'Adresse email invalide' }))
      return
    }
    setEmailErrors((prev) => {
      const next = { ...prev }
      delete next[planKey]
      return next
    })

    setLoadingState((prev) => ({ ...prev, [planKey]: 'loading_checkout' }))
    setCheckoutErrors((prev) => {
      const next = { ...prev }
      delete next[planKey]
      return next
    })

    try {
      if (email) setStripeEmailCookie(email)

      const body: { plan: string; email?: string } = { plan: planKey }
      if (email) body.email = email

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const body_json = await res.json().catch(() => ({}))
        throw new Error(body_json.error ?? 'Erreur lors de la création du checkout')
      }

      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (err) {
      setCheckoutErrors((prev) => ({
        ...prev,
        [planKey]: err instanceof Error ? err.message : 'Une erreur est survenue',
      }))
    } finally {
      setLoadingState((prev) => {
        const next = { ...prev }
        delete next[planKey]
        return next
      })
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
            Commence gratuitement. Passe à Growth ou Pro quand tu ne peux plus t&apos;en passer.
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
          {plans.map((plan) => {
            const isLoading = loadingState[plan.id] === 'loading_checkout'

            return (
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
                        transform: 'scale(1.02)',
                      }
                    : {
                        backgroundColor: 'var(--bg)',
                        border: '1px solid var(--border)',
                        boxShadow:
                          '0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.03)',
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

                {/* Email capture (optional) */}
                <div className="flex flex-col gap-1.5">
                  <input
                    type="email"
                    placeholder="Votre email (optionnel)"
                    value={emailInputs[plan.id] ?? ''}
                    onChange={(e) => {
                      setEmailInputs((prev) => ({ ...prev, [plan.id]: e.target.value }))
                      if (emailErrors[plan.id]) {
                        setEmailErrors((prev) => {
                          const next = { ...prev }
                          delete next[plan.id]
                          return next
                        })
                      }
                    }}
                    className="h-9 px-3 rounded-lg text-sm transition-colors duration-150
                               bg-[var(--surface)] border text-[var(--text)] placeholder:text-[var(--text-3)]
                               focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20
                               border-[var(--border-md)] focus:border-[var(--accent)]"
                  />
                  {emailErrors[plan.id] && (
                    <p className="text-xs text-[var(--red)]">{emailErrors[plan.id]}</p>
                  )}
                </div>

                {/* Checkout error */}
                {checkoutErrors[plan.id] && (
                  <p className="text-xs text-[var(--red)] text-center">
                    {checkoutErrors[plan.id]}
                  </p>
                )}

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
                  onClick={() => handleCheckout(plan.id)}
                  disabled={isLoading}
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
