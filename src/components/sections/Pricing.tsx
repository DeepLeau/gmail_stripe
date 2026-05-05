'use client'

import { useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { Check, Loader2 } from 'lucide-react'

// Les plans canoniques du template — source de vérité pour les noms, prix et limites
const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '0',
    priceSuffix: '€',
    period: 'mois',
    description: 'Pour découvrir Emind sans engagement.',
    limit: null,
    features: [
      { text: '100 questions / mois', included: true },
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
    id: 'start',
    name: 'Start',
    price: '10',
    priceSuffix: '€',
    period: 'mois',
    description: '10 messages par mois. Idéal pour tester.',
    limit: 10,
    features: [
      { text: '10 messages / mois', included: true },
      { text: '1 boîte mail connectée', included: true },
      { text: 'Résumés de threads', included: true },
      { text: 'Recherche en langage naturel', included: true },
      { text: 'Multi-comptes', included: false },
      { text: 'Priorité de traitement', included: false },
    ],
    cta: 'Choisir Start',
    highlighted: false,
  },
  {
    id: 'scale',
    name: 'Scale',
    price: '39',
    priceSuffix: '€',
    period: 'mois',
    description: '50 messages par mois. Pour les utilisateurs réguliers.',
    limit: 50,
    features: [
      { text: '50 messages / mois', included: true },
      { text: 'Boîtes mail illimitées', included: true },
      { text: 'Résumés de threads', included: true },
      { text: 'Recherche en langage naturel', included: true },
      { text: 'Multi-comptes', included: true },
      { text: 'Priorité de traitement', included: false },
    ],
    cta: 'Choisir Scale',
    highlighted: false,
  },
  {
    id: 'team',
    name: 'Team',
    price: '79',
    priceSuffix: '€',
    period: 'mois',
    description: '100 messages par mois. Le plus complet.',
    limit: 100,
    features: [
      { text: '100 messages / mois', included: true },
      { text: 'Boîtes mail illimitées', included: true },
      { text: 'Résumés de threads', included: true },
      { text: 'Recherche en langage naturel', included: true },
      { text: 'Multi-comptes', included: true },
      { text: 'Priorité de traitement', included: true },
    ],
    cta: 'Choisir Team',
    highlighted: true,
  },
]

type LoadingKey = 'start' | 'scale' | 'team' | null

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
}

export function Pricing() {
  const [loadingKey, setLoadingKey] = useState<LoadingKey>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleCheckout(planId: string) {
    setLoadingKey(planId as 'start' | 'scale' | 'team')
    setErrorMsg(null)
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
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('URL de paiement non reçue')
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Une erreur est survenue')
      setLoadingKey(null)
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
            Commence gratuitement. Passe à Start, Scale ou Team quand tu en as besoin.
          </motion.p>
        </div>

        {/* Message d'erreur */}
        {errorMsg && (
          <div className="mb-6 text-center">
            <p className="text-sm text-[var(--red)] py-2 px-4 rounded-lg bg-[var(--red)]/5 border border-[var(--red)]/15 inline-block">
              {errorMsg}
            </p>
          </div>
        )}

        {/* Cards — grille 2×2 sur desktop, stack sur mobile */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start"
        >
          {PLANS.map((plan) => {
            const isLoading = loadingKey === plan.id

            return (
              <motion.div
                key={plan.id}
                variants={cardVariants}
                className="relative rounded-xl p-7 flex flex-col gap-5"
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                style={
                  plan.highlighted
                    ? {
                        backgroundColor: 'var(--bg)',
                        border: '2px solid #f59e0b',
                        boxShadow: '0 20px 60px rgba(245, 158, 11, 0.15), 0 0 40px rgba(245, 158, 11, 0.06)',
                        zIndex: 1,
                      }
                    : {
                        backgroundColor: 'var(--bg)',
                        border: '1px solid var(--border)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.03)',
                      }
                }
              >
                {/* Top accent line — Team uniquement */}
                {plan.highlighted && (
                  <div
                    className="absolute top-0 left-[12%] right-[12%] h-[3px] rounded-b-full"
                    style={{
                      background: 'linear-gradient(90deg, transparent, #f59e0b, transparent)',
                    }}
                  />
                )}

                {/* Badge — Team */}
                {plan.highlighted && (
                  <div className="flex justify-center -mt-1">
                    <span
                      className="inline-flex px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest"
                      style={{
                        background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
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
                        color: plan.highlighted ? '#f59e0b' : plan.id !== 'free' ? 'var(--accent)' : 'var(--text)',
                        letterSpacing: '-0.04em',
                      }}
                    >
                      {plan.price}
                    </span>
                    <span
                      className="text-sm"
                      style={{ color: 'var(--text-3)' }}
                    >
                      {plan.priceSuffix} / {plan.period}
                    </span>
                  </div>

                  {/* Limite affichée pour les plans payants */}
                  {plan.limit !== null && (
                    <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                      {plan.limit} messages / mois
                    </p>
                  )}
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
                          style={{ color: plan.highlighted ? '#f59e0b' : 'var(--accent)' }}
                        />
                      ) : (
                        <span className="mt-0.5 flex-shrink-0 w-4 h-4 flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <line x1="4" y1="4" x2="12" y2="12" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round" />
                            <line x1="12" y1="4" x2="4" y2="12" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </span>
                      )}
                      {feature.text}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {plan.id === 'free' ? (
                  <a
                    href={plan.href}
                    className="w-full h-11 rounded-xl text-sm font-medium transition-all duration-150 flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: 'transparent',
                      color: 'var(--text-2)',
                      border: '1px solid var(--border-md)',
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLAnchorElement
                      el.style.borderColor = 'var(--accent)'
                      el.style.color = 'var(--accent)'
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLAnchorElement
                      el.style.borderColor = 'var(--border-md)'
                      el.style.color = 'var(--text-2)'
                    }}
                  >
                    {plan.cta}
                  </a>
                ) : (
                  <button
                    className="w-full h-11 rounded-xl text-sm font-medium transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={isLoading}
                    style={
                      plan.highlighted
                        ? {
                            backgroundColor: '#f59e0b',
                            color: '#fff',
                            boxShadow: '0 4px 16px rgba(245, 158, 11, 0.3)',
                          }
                        : {
                            backgroundColor: 'var(--accent)',
                            color: '#fff',
                            boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
                          }
                    }
                    onMouseEnter={(e) => {
                      if (!isLoading) {
                        const el = e.currentTarget as HTMLButtonElement
                        el.style.transform = 'translateY(-1px)'
                        el.style.filter = 'brightness(1.08)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLButtonElement
                      el.style.transform = ''
                      el.style.filter = ''
                    }}
                    onClick={() => handleCheckout(plan.id)}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={15} className="animate-spin shrink-0" />
                        <span>Redirection…</span>
                      </>
                    ) : (
                      <span>{plan.cta}</span>
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
