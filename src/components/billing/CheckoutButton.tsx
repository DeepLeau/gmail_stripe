'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

interface CheckoutButtonProps {
  planId: string
  label: string
  highlighted?: boolean
}

export function CheckoutButton({ planId, label, highlighted = false }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleCheckout() {
    setIsLoading(true)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      })

      if (!response.ok) {
        console.error('[CheckoutButton] Checkout failed:', response.status)
        return
      }

      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error('[CheckoutButton] Network error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={isLoading}
      className="w-full h-11 rounded-xl text-sm font-medium transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      style={
        highlighted
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
        if (highlighted) {
          ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent-hi)'
          ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'
        } else {
          ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)'
          ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)'
        }
      }}
      onMouseLeave={(e) => {
        if (highlighted) {
          ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent)'
          ;(e.currentTarget as HTMLButtonElement).style.transform = ''
        } else {
          ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-md)'
          ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-2)'
        }
      }}
    >
      {isLoading ? (
        <>
          <Loader2 size={15} className="animate-spin shrink-0" />
          <span>Redirection...</span>
        </>
      ) : (
        <span>{label}</span>
      )}
    </button>
  )
}
