'use client'

import { motion, type Variants } from 'framer-motion'
import { Check, X, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

type PlanSlug = 'starter' | 'growth' | 'pro'

type ButtonState = 'idle' | 'loading_checkout'

interface PlanDef {
  slug: PlanSlug
  name: string
  price: string
  priceDisplay: string
  period: string
  description: string
  messagesLimit: number
  messagesLabel: string
  features: Array<{ text: string; included: boolean }>
  cta: string
  highlighted: boolean
  badge?: string
}

const PLANS: PlanDef[] = [
  {
    slug: 'starter',
    name: 'Starter',
    price: '9',
    priceDisplay: '9',
    period: 'mois',
    description: 'Pour démarrer avec Emind et explorer vos emails.',
    messagesLimit: 50,
    messagesLabel: '50 messages / mois',
    features: [
      { text: '50 messages / mois', included: true },
      { text: '1 boîte email connectée', included: true },
      { text: 'Réponses en 10 secondes', included: true },
      { text: 'Recherche en langage naturel', included: true },
      { text: 'Multi-comptes', included: false },
      { text: 'Priorité de traitement', included: false },
    ],
    cta: 'Commencer avec Starter',
    highlighted: false,
  },
  {
    slug: 'growth',
    name: 'Growth',
    price: '29',
    priceDisplay: '29',
    period: 'mois',
    description: 'Le juste équilibre entre puissance et volume.',
    messagesLimit: 200,
    messagesLabel: '200 messages / mois',
    features: [
      { text: '200 messages / mois', included: true },
      { text: '3 boîtes email connectées', included: true },
      { text: 'Réponses en 5 secondes', included: true },
      { text: 'Recherche en langage naturel', included: true },
      { text: 'Multi-comptes', included: true },
      { text: 'Priorité de traitement', included: false },
    ],
    cta: 'Passer à Growth',
    highlighted: true,
    badge: 'Populaire',
  },
  {
    slug: 'pro',
    name: 'Pro',
    price: '79',
    priceDisplay: '79',
    period: 'mois',
    description: 'Pour les power users qui ne veulent pas de limites.',
    messagesLimit: 1000,
    messagesLabel: '1 000 messages / mois',
    features: [
      { text: '1 000 messages / mois', included: true },
      { text: 'Boîtes email illimitées', included: true },
      { text: 'Réponses en 3 secondes', included: true },
      { text: 'Recherche en langage naturel', included: true },
      { text: 'Multi-comptes', included: true },
      { text: 'Priorité de traitement', included: true },
    ],
    cta: 'Passer à Pro',
    highlighted: false,
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
  const [buttonStates, setButtonStates] = useState<Record<PlanSlug, ButtonState>>({
    starter: 'idle',
    growth: 'idle',
    pro: 'idle',
  })
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleCheckout(slug: PlanSlug) {
    if (buttonStates[slug] === 'loading_checkout') return

    setButtonStates((prev) => ({ ...prev, [slug]: 'loading_checkout' }))
    setErrorMessage(null)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: slug }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMessage(data.error ?? 'Une erreur est survenue')
        setButtonStates((prev) => ({ ...prev, [slug]: 'idle' }))
        return
      }

      if (!data.url) {
        setErrorMessage('URL de paiement introuvable')
        setButtonStates((prev) => ({ ...prev, [slug]: 'idle' }))
        return
      }

      window.location.href = data.url
    } catch {
      setErrorMessage('Impossible de contacter le serveur de paiement')
      setButtonStates((prev) => ({ ...prev, [slug]: 'idle' }))
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

        {/* Error message */}
        {errorMessage && (
          <div className="max-w-5xl mx-auto mb-6">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[var(--red)]/[0.07] border border-[var(--red)]/20">
              <p className="text-sm text-[var(--red)]">{errorMessage}</p>
            </div>
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
          {PLANS.map((plan) => {
            const isLoading = buttonStates[plan.slug] === 'loading_checkout'

            return (
              <motion.div
                key={plan.slug}
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
                        boxShadow:
                          '0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.03)',
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
                  <div className="flex items-baseline gap-1.5 mb-1">
                    <span
                      className="text-4xl font-bold tracking-tight"
                      style={{
                        color: plan.highlighted ? 'var(--accent)' : 'var(--text)',
                        letterSpacing: '-0.04em',
                      }}
                    >
                      {plan.priceDisplay}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--text-3)' }}>
                      €
                    </span>
                    <span className="text-sm" style={{ color: 'var(--text-3)' }}>
                      / {plan.period}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                    {plan.messagesLabel}
                  </p>
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
                {plan.slug === 'starter' ? (
                  <Link
                    href="/signup"
                    className="w-full h-11 rounded-xl text-sm font-medium transition-all duration-150 flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: 'transparent',
                      color: 'var(--text-2)',
                      border: '1px solid var(--border-md)',
                    }}
                  >
                    {plan.cta}
                  </Link>
                ) : (
                  <button
                    disabled={isLoading}
                    onClick={() => handleCheckout(plan.slug)}
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
                        ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)'
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
                        ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-2)'
                      }
                    }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={15} className="animate-spin shrink-0" />
                        <span>Redirection…</span>
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

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs mt-8"
          style={{ color: 'var(--text-3)', lineHeight: 1.6 }}
        >
          Paiement sécurisé par Stripe. Annulez à tout moment.
        </motion.p>
      </div>
    </section>
  )
}
