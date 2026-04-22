export const dynamic = 'force-dynamic'

import { AuthCard } from '@/components/auth/AuthCard'
import { SignupForm } from '@/components/auth/SignupForm'
import { Suspense } from 'react'

function SuccessSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-10 bg-gray-200 rounded-lg w-3/4 mx-auto" />
      <div className="h-4 bg-gray-100 rounded w-1/2 mx-auto" />
    </div>
  )
}

interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams
  const sessionId = params.session_id

  return (
    <AuthCard
      title="Créer un compte"
      altLinkLabel="Déjà un compte ? Se connecter"
      altLinkHref="/login"
    >
      <div className="mb-6">
        <h2
          className="text-xl font-semibold text-center tracking-tight mb-2"
          style={{ color: 'var(--text)', letterSpacing: '-0.025em' }}
        >
          Paiement confirmé — créez votre compte
        </h2>
        <p
          className="text-sm text-center"
          style={{ color: 'var(--text-2)', lineHeight: 1.6 }}
        >
          Votre paiement a bien été enregistré. Créez votre compte pour activer
          votre abonnement.
        </p>
      </div>
      <Suspense fallback={<SuccessSkeleton />}>
        <SignupForm stripeSessionId={sessionId} />
      </Suspense>
    </AuthCard>
  )
}
