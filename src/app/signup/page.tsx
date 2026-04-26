export const dynamic = 'force-dynamic'

import { AuthCard } from '@/components/auth/AuthCard'
import { SignupForm } from '@/components/auth/SignupForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Créer un compte — Emind',
}

interface SignupPageProps {
  searchParams: Promise<{ session_id?: string }>
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const { session_id } = await searchParams

  return (
    <AuthCard
      title="Créer un compte"
      altLinkLabel="Déjà un compte ? Se connecter"
      altLinkHref="/login"
    >
      {session_id && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200">
          <p className="text-xs font-semibold text-green-700 mb-0.5">
            Abonnement attaché
          </p>
          <p className="text-xs text-green-600">
            Votre abonnement sera lié après la création du compte
          </p>
        </div>
      )}
      <SignupForm sessionId={session_id} />
    </AuthCard>
  )
}
