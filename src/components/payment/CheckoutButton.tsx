'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

interface CheckoutButtonProps {
  planId: string
  planName: string
  className?: string
}

export function CheckoutButton({ planId, planName, className = '' }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isHighlighted = planName === 'Scale'

  async function handleCheckout() {
    if (isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la création du checkout')
      }

      const { url } = await response.json()

      if (url) {
        window.location.href = url
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleCheckout}
        disabled={isLoading}
        className={`w-full h-11 rounded-xl text-sm font-medium transition-all duration-150 flex items-center justify-center gap-2 ${className}`}
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
        onMouseEnter={(e) => {
          if (isHighlighted) {
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
            <Loader2 size={15} className="animate-spin shrink-0" />
            <span>Redirection...</span>
          </>
        ) : (
          <span>Choisir {planName}</span>
        )}
      </button>

      {error && (
        <p className="text-xs text-center text-[var(--red)]">{error}</p>
      )}
    </div>
  )
}
