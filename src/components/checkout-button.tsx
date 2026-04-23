'use client'

import { useState } from 'react'
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react'

interface CheckoutButtonProps {
  planId: string
  planName: string
  className?: string
}

export default function CheckoutButton({
  planId,
  planName,
  className = '',
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleCheckout = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue')
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('URL de paiement non reçue')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleCheckout}
        disabled={isLoading}
        className={`
          relative w-full px-6 py-3 rounded-lg font-medium
          bg-zinc-900 text-white
          hover:bg-zinc-800
          disabled:opacity-70 disabled:cursor-not-allowed
          transition-all duration-200
          flex items-center justify-center gap-2
          ${className}
        `}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Redirection...
          </>
        ) : (
          <>Choisir {planName}</>
        )}
      </button>

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {success && !isLoading && (
        <div className="flex items-center gap-2 text-green-500 text-sm">
          <CheckCircle className="w-4 h-4" />
          <span>Redirection en cours...</span>
        </div>
      )}
    </div>
  )
}
