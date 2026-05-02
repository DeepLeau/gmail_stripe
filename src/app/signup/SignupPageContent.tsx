'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { AuthCard } from '@/components/auth/AuthCard'
import { SignupForm } from '@/components/auth/SignupForm'
import { SuccessView } from '@/components/auth/SuccessView'

function SignupPageInner() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  if (sessionId) {
    return (
      <AuthCard
        title="Bienvenue sur Emind"
        altLinkLabel="Déjà un compte ? Se connecter"
        altLinkHref="/login"
      >
        <SuccessView sessionId={sessionId} />
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Créer un compte"
      altLinkLabel="Déjà un compte ? Se connecter"
      altLinkHref="/login"
    >
      <SignupForm />
    </AuthCard>
  )
}

export function SignupPageContent() {
  return (
    <Suspense
      fallback={
        <AuthCard
          title="Créer un compte"
          altLinkLabel="Déjà un compte ? Se connecter"
          altLinkHref="/login"
        >
          <div className="flex items-center justify-center h-32">
            <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
          </div>
        </AuthCard>
      }
    >
      <SignupPageInner />
    </Suspense>
  )
}
