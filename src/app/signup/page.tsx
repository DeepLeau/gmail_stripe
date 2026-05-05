export const dynamic = 'force-dynamic'

import { AuthCard } from '@/components/auth/AuthCard'
import { SignupForm } from '@/components/auth/SignupForm'
import { Suspense } from 'react'

interface SignupPageProps {
  searchParams: Promise<{ session_id?: string }>
}

async function SignupPageContent({ searchParams }: SignupPageProps) {
  const params = await searchParams
  return (
    <AuthCard
      title="Créer un compte"
      altLinkLabel="Déjà un compte ? Se connecter"
      altLinkHref="/login"
    >
      <SignupForm pendingSessionId={params.session_id} />
    </AuthCard>
  )
}

export default function SignupPage(props: SignupPageProps) {
  return (
    <Suspense fallback={<AuthCard title="Créer un compte" altLinkLabel="Déjà un compte ?" altLinkHref="/login"><div className="h-48 flex items-center justify-center text-sm text-[var(--text-3)]">Chargement...</div></AuthCard>}>
      <SignupPageContent {...props} />
    </Suspense>
  )
}
