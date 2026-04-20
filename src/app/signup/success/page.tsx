'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle2, AlertCircle, CreditCard } from 'lucide-react'

type FinalizationState = 'loading' | 'success' | 'error'

export default function SignupSuccessPage() {
  const router = useRouter()
  const [state, setState] = useState<FinalizationState>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    async function finalize() {
      try {
        // Read stripe_session_id from cookies
        const cookies = document.cookie.split(';')
        const stripeSessionCookie = cookies.find((c) =>
          c.trim().startsWith('stripe_session_id=')
        )

        if (!stripeSessionCookie) {
          // No session found, redirect to pricing
          router.replace('/#pricing')
          return
        }

        const sessionId = stripeSessionCookie.split('=')[1]

        if (!sessionId) {
          router.replace('/#pricing')
          return
        }

        // Call server action to finalize signup
        const response = await fetch('/api/signup/finalize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error ?? 'Échec de la finalisation')
        }

        // Delete the cookie client-side
        document.cookie =
          'stripe_session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'

        setState('success')

        // Redirect to chat after a short delay
        setTimeout(() => {
          router.replace('/chat')
        }, 2000)
      } catch (err) {
        setState('error')
        setErrorMessage(
          err instanceof Error
            ? err.message
            : 'Une erreur est survenue lors de la finalisation'
        )
      }
    }

    finalize()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        {/* Card */}
        <div
          className="rounded-xl p-8 text-center"
          style={{
            backgroundColor: 'var(--surface-1)',
            border: '1px solid var(--border-md)',
          }}
        >
          {/* Icon */}
          <div
            className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{
              backgroundColor:
                state === 'success'
                  ? 'rgba(74, 222, 128, 0.1)'
                  : state === 'error'
                  ? 'rgba(248, 113, 113, 0.1)'
                  : 'var(--accent-light)',
            }}
          >
            {state === 'loading' && (
              <Loader2
                size={28}
                className="animate-spin"
                style={{ color: 'var(--accent)' }}
              />
            )}
            {state === 'success' && (
              <CheckCircle2
                size={28}
                style={{ color: 'var(--green)' }}
              />
            )}
            {state === 'error' && (
              <AlertCircle size={28} style={{ color: 'var(--red)' }} />
            )}
          </div>

          {/* Content */}
          <div className="space-y-3">
            {state === 'loading' && (
              <>
                <h1
                  className="text-lg font-semibold"
                  style={{ color: 'var(--text)' }}
                >
                  Finalisation en cours...
                </h1>
                <p
                  className="text-sm"
                  style={{ color: 'var(--text-2)', lineHeight: 1.6 }}
                >
                  Nous confirmons votre paiement et activons votre compte.
                  Cette opération peut prendre quelques secondes.
                </p>
              </>
            )}

            {state === 'success' && (
              <>
                <h1
                  className="text-lg font-semibold"
                  style={{ color: 'var(--text)' }}
                >
                  Compte activé !
                </h1>
                <p
                  className="text-sm"
                  style={{ color: 'var(--text-2)', lineHeight: 1.6 }}
                >
                  Votre paiement a été confirmé. Redirection vers le chat...
                </p>
              </>
            )}

            {state === 'error' && (
              <>
                <h1
                  className="text-lg font-semibold"
                  style={{ color: 'var(--text)' }}
                >
                  Erreur de finalisation
                </h1>
                <p
                  className="text-sm"
                  style={{ color: 'var(--text-2)', lineHeight: 1.6 }}
                >
                  {errorMessage ??
                    'Une erreur est survenue. Veuillez contacter le support.'}
                </p>
                <a
                  href="/#pricing"
                  className="inline-flex items-center justify-center h-9 px-5 mt-4 rounded-lg
                             bg-[var(--accent)] hover:bg-[var(--accent-hi)] text-white
                             text-sm font-medium transition-colors duration-150"
                >
                  Retourner aux tarifs
                </a>
              </>
            )}
          </div>

          {/* Progress indicator */}
          {state === 'loading' && (
            <div className="mt-6">
              <div
                className="h-1 rounded-full overflow-hidden"
                style={{ backgroundColor: 'var(--border)' }}
              >
                <div
                  className="h-full rounded-full animate-pulse"
                  style={{
                    backgroundColor: 'var(--accent)',
                    width: '60%',
                  }}
                />
              </div>
            </div>
          )}

          {/* Credit card icon decoration */}
          {state === 'loading' && (
            <div className="mt-4 flex items-center justify-center gap-1">
              <CreditCard
                size={12}
                style={{ color: 'var(--text-3)' }}
                strokeWidth={1.5}
              />
              <span className="text-xs" style={{ color: 'var(--text-3)' }}>
                Paiement sécurisé Stripe
              </span>
            </div>
          )}
        </div>

        {/* Loading dots animation */}
        {state === 'loading' && (
          <div className="flex items-center justify-center gap-1 mt-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full animate-bounce"
                style={{
                  backgroundColor: 'var(--accent)',
                  animationDelay: `${i * 150}ms`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
