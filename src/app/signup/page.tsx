import { Suspense } from 'react'
import { AuthCard } from '@/components/auth/AuthCard'
import { SignupForm } from '@/components/auth/SignupForm'

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
      <SignupForm pendingSessionId={params.session_id ?? null} />
    </AuthCard>
  )
}

export default function SignupPage({ searchParams }: SignupPageProps) {
  return (
    <Suspense>
      <SignupPageContent searchParams={searchParams} />
    </Suspense>
  )
}
