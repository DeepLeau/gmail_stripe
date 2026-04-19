export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { AuthCard } from '@/components/auth/AuthCard'
import { SignupForm } from '@/components/auth/SignupForm'

type SignupPageProps = {
  searchParams: Promise<{ session_id?: string }>
}

async function SignupContent({ sessionId }: { sessionId: string | undefined }) {
  // Le plan n'est pas connu côté client — on ne le reçoit qu'après confirmation Stripe.
  // On passe sessionId au SignupForm qui le transmet à /api/stripe/confirm.
  return (
    <SignupForm
      sessionId={sessionId}
      planPreview={sessionId ? 'payant' : null}
    />
  )
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams
  const sessionId = params.session_id

  return (
    <AuthCard
      title={sessionId ? 'Finaliser ton inscription' : 'Créer un compte'}
      altLinkLabel="Déjà un compte ? Se connecter"
      altLinkHref="/login"
    >
      <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-[var(--surface-2)]" />}>
        <SignupContent sessionId={sessionId} />
      </Suspense>
    </AuthCard>
  )
}
