import { Suspense } from 'react'
import { AuthCard } from '@/components/auth/AuthCard'
import { SignupForm } from '@/components/auth/SignupForm'

export const dynamic = 'force-dynamic'

function PaymentBanner() {
  return (
    <div className="mb-4 p-3 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20">
      <p className="text-sm text-center" style={{ color: 'var(--accent)' }}>
        💳 Paiement confirmé — créez votre compte pour activer votre plan
      </p>
    </div>
  )
}

interface SignupPageProps {
  searchParams: Promise<{ session_id?: string }>
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams
  const hasSessionId = !!params.session_id

  return (
    <AuthCard
      title="Créer un compte"
      altLinkLabel="Déjà un compte ? Se connecter"
      altLinkHref="/login"
    >
      <Suspense fallback={null}>
        {hasSessionId && <PaymentBanner />}
        <SignupForm />
      </Suspense>
    </AuthCard>
  )
}
