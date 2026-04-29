'use client'

import { useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { Check, X } from 'lucide-react'

type PlanId = 'start' | 'scale' | 'team'

interface PlanConfig {
  id: PlanId
  name: string
  price: string
  period: string
  description: string
  messagesLimit: number
  features: { text: string; included: boolean }[]
  cta: string
  highlighted: boolean
  badge?: string
}

const plans: PlanConfig[] = [
  {
    id: 'start',
    name: 'Start',
    price: '9 €',
    period: 'mois',
    description: 'Pour découvrir Emind et vos capacités de base.',
    messagesLimit: 10,
    features: [
      { text: '10 messages / mois', included: true },
      { text: '1 boîte mail connectée', included: true },
      { text: 'Réponses en 10 secondes', included: true },
      { text: 'Support par email', included: true },
      { text: 'Multi-comptes', included: false },
      { text: 'Priorité de traitement', included: false },
    ],
    cta: 'Choisir Start',
    highlighted: false,
  },
  {
    id: 'scale',
    name: 'Scale',
    price: '29 €',
    period: 'mois',
    description: 'Pour les professionnels qui gèrent plusieurs boîtes email.',
    messagesLimit: 50,
    features: [
      { text: '50 messages / mois', included: true },
      { text: 'Plusieurs boîtes mail', included: true },
      { text: 'Réponses en 5 secondes', included: true },
      { text: 'Support prioritaire', included: true },
      { text: 'Multi-comptes', included: true },
      { text: 'Historique illimité', included: true },
    ],
    cta: 'Choisir Scale',
    highlighted: true,
    badge: 'Recommandé',
  },
  {
    id: 'team',
    name: 'Team',
    price: '59 €',
    period: 'mois',
    description: 'Pour les équipes qui maximisent leur productivité.',
    messagesLimit: 100,
    features: [
      { text: '100 messages / mois', included: true },
      { text: 'Boîtes mail illimitées', included: true },
      { text: 'Réponses en 3 secondes', included: true },
      { text: 'Support prioritaire', included: true },
      { text: 'Multi-comptes', included: true },
      { text: 'Historique illimité', included: true },
    ],
    cta: 'Choisir Team',
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

// Spinner SVG for loading state
function SpinnerIcon() {
  return (
    <svg
      className="animate-spin"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="31.416"
        strokeDashoffset="10"
        opacity="0.25"
      />
      <path
        d="M12 2C6.47715 2 2 6.47715 2 12"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

interface ErrorMessageProps {
  message: string
}

function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div
      className="mt-3 text-xs text-center py-2 px-3 rounded-lg animate-in fade-in slide-in-from-top-2"
      style={{
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        color: 'var(--red, #ef4444)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
      }}
    >
      {message}
    </div>
  )
}

interface PlanCardProps {
  plan: PlanConfig
  isLoading: boolean
  error: string | null
  onSelect: (planId: PlanId) => void
}

function PlanCard({ plan, isLoading, error, onSelect }: PlanCardProps) {
  return (
    <motion.div
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
        <div className="flex items-baseline gap-1.5 mb-2">
          <span
            className="text-4xl font-bold tracking-tight"
            style={{ color: plan.highlighted ? 'var(--accent)' : 'var(--text)', letterSpacing: '-0.04em' }}
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
        <p
          className="text-xs"
          style={{ color: 'var(--text-3)' }}
        >
          {plan.messagesLimit} messages / mois
        </p>
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

      {/* CTA Button */}
      <button
        onClick={() => onSelect(plan.id)}
        disabled={isLoading}
        className="w-full h-11 rounded-xl text-sm font-medium transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
          if (!isLoading) {
            if (plan.highlighted) {
              ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
                'var(--accent-hi)'
              ;(e.currentTarget as HTMLButtonElement).style.transform =
                'translateY(-1px)'
            } else {
              ;(e.currentTarget as HTMLButtonElement).style.borderColor =
                'var(--accent)'
              ;(e.currentTarget as HTMLButtonElement).style.color =
                'var(--accent)'
            }
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
            <SpinnerIcon />
            <span>Redirection...</span>
          </>
        ) : (
          plan.cta
        )}
      </button>

      {/* Error message under the card */}
      {error && <ErrorMessage message={error} />}
    </motion.div>
  )
}

export function Pricing() {
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null)
  const [errors, setErrors] = useState<Record<PlanId, string | null>>({
    start: null,
    scale: null,
    team: null,
  })

  async function handleSelectPlan(planId: PlanId) {
    setLoadingPlan(planId)
    setErrors((prev) => ({ ...prev, [planId]: null }))

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Erreur lors de la création du checkout')
      }

      const { url } = await res.json()
      if (url) {
        window.location.href = url
      } else {
        throw new Error('URL de checkout non reçue')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue'
      setErrors((prev) => ({ ...prev, [planId]: message }))
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
            Commence gratuitement. Passe à un plan supérieur quand tu ne peux plus t&apos;en passer.
          </motion.p>
        </div>

        {/* Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start"
        >
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isLoading={loadingPlan === plan.id}
              error={errors[plan.id]}
              onSelect={handleSelectPlan}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
