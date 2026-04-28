'use client'

import { useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { Check, X, Loader2 } from 'lucide-react'
import { getPlanDisplayName } from '@/lib/stripe/config'

interface Plan {
  id: string
  displayName: string
  price: number
  limit: number
  features: Array<{
    text: string
    included: boolean
  }>
}

const PLANS_CONFIG: Plan[] = [
  {
    id: 'start',
    displayName: 'Start',
    price: 10,
    limit: 10,
    features: [
      { text: '10 questions / mois', included: true },
      { text: '1 boîte mail connectée', included: true },
      { text: 'Résumés de threads', included: true },
      { text: 'Recherche en langage naturel', included: true },
      { text: 'Multi-comptes', included: false },
      { text: 'Priorité de traitement', included: false },
    ],
  },
  {
    id: 'scale',
    displayName: 'Scale',
    price: 19,
    limit: 50,
    features: [
      { text: '50 questions / mois', included: true },
      { text: '1 boîte mail connectée', included: true },
      { text: 'Résumés de threads', included: true },
      { text: 'Recherche en langage naturel', included: true },
      { text: 'Multi-comptes', included: true },
      { text: 'Priorité de traitement', included: false },
    ],
  },
  {
    id: 'team',
    displayName: 'Team',
    price: 49,
    limit: 100,
    features: [
      { text: '100 questions / mois', included: true },
      { text: 'Plusieurs boîtes mail', included: true },
      { text: 'Résumés de threads', included: true },
      { text: 'Recherche en langage naturel', included: true },
      { text: 'Multi-comptes', included: true },
      { text: 'Priorité de traitement', included: true },
    ],
  },
]

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

interface PlanPickerProps {
  currentPlanId?: string | null
}

export function PlanPicker({ currentPlanId }: PlanPickerProps) {
  const [loadingKey, setLoadingKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleCheckout(planId: string) {
    setLoadingKey(planId)
    setError(null)
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
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoadingKey(null)
    }
  }

  function isCurrentPlan(planId: string): boolean {
    if (!currentPlanId) return false
    return planId === currentPlanId
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div
          className="px-4 py-3 rounded-lg text-sm"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            border: '1px solid rgba(239, 68, 68, 0.2)',
          }}
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS_CONFIG.map((plan) => {
          const isCurrent = isCurrentPlan(plan.id)
          const isScale = plan.id === 'scale'
          const isLoading = loadingKey === plan.id

          return (
            <motion.div
              key={plan.id}
              variants={cardVariants}
              className="relative rounded-xl p-6 flex flex-col gap-5"
              style={
                isScale
                  ? {
                      backgroundColor: 'var(--bg)',
                      border: '2px solid var(--accent)',
                      boxShadow: '0 12px 40px rgba(59, 130, 246, 0.1)',
                    }
                  : {
                      backgroundColor: 'var(--bg)',
                      border: '1px solid var(--border)',
                    }
              }
            >
              {/* Badge "Recommandé" for Scale */}
              {isScale && (
                <div className="flex justify-center">
                  <span
                    className="inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
                    style={{
                      background: 'linear-gradient(135deg, var(--accent), var(--violet))',
                      color: '#fff',
                    }}
                  >
                    Recommandé
                  </span>
                </div>
              )}

              {/* Plan header */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: 'var(--text)' }}
                  >
                    {plan.displayName}
                  </h3>
                  {isCurrent && (
                    <span
                      className="inline-flex px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider"
                      style={{
                        backgroundColor: 'var(--accent-light)',
                        color: 'var(--accent)',
                      }}
                    >
                      Actuel
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span
                    className="text-3xl font-bold"
                    style={{
                      color: isScale ? 'var(--accent)' : 'var(--text)',
                      letterSpacing: '-0.03em',
                    }}
                  >
                    {plan.price} €
                  </span>
                  <span className="text-sm" style={{ color: 'var(--text-3)' }}>
                    / mois
                  </span>
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>
                  {plan.limit} questions / mois
                </p>
              </div>

              {/* Divider */}
              <div className="h-px" style={{ backgroundColor: 'var(--border)' }} />

              {/* Features */}
              <ul className="flex flex-col gap-2.5 flex-1">
                {plan.features.map((feature, j) => (
                  <li
                    key={j}
                    className="flex items-start gap-2 text-sm"
                    style={{
                      color: feature.included ? 'var(--text-2)' : 'var(--text-3)',
                    }}
                  >
                    {feature.included ? (
                      <Check
                        size={15}
                        className="mt-0.5 flex-shrink-0"
                        strokeWidth={2.5}
                        style={{ color: 'var(--accent)' }}
                      />
                    ) : (
                      <X
                        size={15}
                        className="mt-0.5 flex-shrink-0"
                        strokeWidth={2.5}
                        style={{ color: 'var(--text-3)' }}
                      />
                    )}
                    {feature.text}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                className="w-full h-10 rounded-lg text-sm font-medium transition-all duration-150 flex items-center justify-center gap-2"
                disabled={isCurrent || isLoading}
                onClick={() => handleCheckout(plan.id)}
                style={
                  isCurrent
                    ? {
                        backgroundColor: 'var(--bg)',
                        color: 'var(--text-3)',
                        border: '1px solid var(--border)',
                        cursor: 'not-allowed',
                      }
                    : isScale
                    ? {
                        backgroundColor: 'var(--accent)',
                        color: '#fff',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
                      }
                    : {
                        backgroundColor: 'transparent',
                        color: 'var(--text-2)',
                        border: '1px solid var(--border-md)',
                      }
                }
              >
                {isCurrent ? (
                  <span className="flex items-center gap-2">
                    Plan actuel
                  </span>
                ) : isLoading ? (
                  <>
                    Redirection...
                    <Loader2 size={14} className="animate-spin shrink-0" />
                  </>
                ) : (
                  <>
                    Choisir {plan.displayName}
                  </>
                )}
              </button>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
