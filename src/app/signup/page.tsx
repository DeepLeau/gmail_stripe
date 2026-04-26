'use client'

import { AuthCard } from '@/components/auth/AuthCard'
import { SignupForm } from '@/components/auth/SignupForm'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'

export const dynamic = 'force-dynamic'

function SignupContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id') ?? undefined
  const [linkedPlan, setLinkedPlan] = useState<string | null>(null)
  const [linkError, setLinkError] = useState<string | null>(null)

  async function handleSignupSuccess() {
    if (!sessionId) return

    try {
      const res = await fetch('/api/stripe/account-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Erreur lors de la création du compte')
      }

      const data = await res.json()
      setLinkedPlan(data.plan ?? 'votre abonnement')
    } catch (err) {
      setLinkError(err instanceof Error ? err.message : 'Une erreur est survenue')
    }
  }

  if (linkedPlan) {
    return (
      <AuthCard
        title="Compte créé !"
        altLinkLabel="Déjà un compte ? Se connecter"
        altLinkHref="/login"
      >
        <div className="text-center py-8">
          <div
            className="w-14 h-14 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ backgroundColor: 'var(--accent-light)' }}
          >
            <svg
              className="w-7 h-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              style={{ color: 'var(--accent)' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-base mb-2" style={{ color: 'var(--text)' }}>
            Bienvenue ! Ton abonnement {linkedPlan} est actif.
          </p>
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>
            Tu peux maintenant discuter avec tes emails.
          </p>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Créer un compte"
      altLinkLabel="Déjà un compte ? Se connecter"
      altLinkHref="/login"
    >
      <SignupForm sessionId={sessionId} onSignupSuccess={handleSignupSuccess} />
      {linkError && (
        <p className="mt-4 text-sm text-center" style={{ color: 'var(--error)' }}>
          {linkError}
        </p>
      )}
    </AuthCard>
  )
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupContent />
    </Suspense>
  )
}
