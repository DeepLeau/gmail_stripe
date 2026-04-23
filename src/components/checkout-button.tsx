'use client'

import { useState } from 'react'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface CheckoutButtonProps {
  planId: string
  planDisplay: string
  messagesLimit: number
  disabled?: boolean
}

type CheckoutState = 'idle' | 'loading' | 'error'

export function CheckoutButton({
  planId,
  planDisplay,
  messagesLimit,
  disabled = false,
}: CheckoutButtonProps) {
  const [state, setState] = useState<CheckoutState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleCheckout() {
    if (state === 'loading' || disabled) return

    setState('loading')
    setErrorMessage(null)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('URL de paiement non reçue')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue'
      setErrorMessage(message)
      setState('error')

      // Reset error state after 5 seconds
      setTimeout(() => {
        setState('idle')
        setErrorMessage(null)
      }, 5000)
    }
  }

  const isLoading = state === 'loading'
  const isError = state === 'error'

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleCheckout}
        disabled={isLoading || disabled}
        className={`
          h-11 px-6 flex items-center justify-center gap-2 rounded-lg
          text-sm font-medium transition-all duration-200
          disabled:opacity-60 disabled:cursor-not-allowed
          ${
            isError
              ? 'bg-red-500/10 border border-red-500/30 text-red-600 hover:bg-red-500/15'
              : 'bg-[var(--accent)] hover:bg-[var(--accent-hi)] text-white'
          }
        `}
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin shrink-0" />
            <span>Redirection vers le paiement...</span>
          </>
        ) : isError ? (
          <>
            <AlertCircle size={16} className="shrink-0" />
            <span>Réessayer</span>
          </>
        ) : (
          <span>
            Choisir {planDisplay}
          </span>
        )}
      </button>

      {isError && errorMessage && (
        <p className="text-xs text-red-500 text-center">{errorMessage}</p>
      )}

      {!isError && !isLoading && (
        <p className="text-xs text-[var(--text-3)] text-center">
          {messagesLimit} messages/mois
        </p>
      )}
    </div>
  )
}
