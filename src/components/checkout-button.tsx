/**
 * src/components/checkout-button.tsx
 *
 * Bouton CTA pour les plans Stripe — appelé depuis Pricing.tsx.
 * Gère les états idle/loading/redirecting.
 *
 * Flow :
 *   1. User clique sur un plan (Starter/Growth/Pro)
 *   2. POST /api/stripe/checkout { plan: 'starter' | 'growth' | 'pro' }
 *   3. Stripe redirige l'user vers success_url (/signup?session_id=...)
 */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { ExternalLink } from 'lucide-react'
import type { StripePlanName } from '@/lib/stripe/config'

interface CheckoutButtonProps {
  planId: string
  label: string
  highlighted?: boolean
}

type ButtonState = 'idle' | 'loading' | 'redirecting'

export function CheckoutButton({ planId, label, highlighted = false }: CheckoutButtonProps) {
  const [state, setState] = useState<ButtonState>('idle')
  const router = useRouter()

  async function handleClick() {
    if (state !== 'idle') return

    setState('loading')

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        console.error('[CheckoutButton] Checkout error:', data.error)
        setState('idle')
        return
      }

      const { url } = await response.json()

      if (!url) {
        console.error('[CheckoutButton] No redirect URL from checkout API')
        setState('idle')
        return
      }

      setState('redirecting')
      window.location.href = url
    } catch (err) {
      console.error('[CheckoutButton] Unexpected error:', err)
      setState('idle')
    }
  }

  const isLoading = state === 'loading' || state === 'redirecting'

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="w-full h-11 rounded-xl text-sm font-medium transition-all duration-150 flex items-center justify-center gap-2"
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
          <span>{state === 'redirecting' ? 'Redirection...' : 'Chargement...'}</span>
        </>
      ) : (
        <>
          <span>{label}</span>
          <ExternalLink size={13} strokeWidth={2} className="shrink-0" />
        </>
      )}
    </button>
  )
}
