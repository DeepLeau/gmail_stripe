export const dynamic = 'force-dynamic'

import { AuthCard } from '@/components/auth/AuthCard'
import { SignupForm } from '@/components/auth/SignupForm'

interface SignupPageProps {
  searchParams: Promise<{ session_token?: string }>
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams
  const pendingSessionToken = params.session_token

  return (
    <AuthCard
      title="Créer un compte"
      altLinkLabel="Déjà un compte ? Se connecter"
      altLinkHref="/login"
    >
      <SignupForm pendingSessionToken={pendingSessionToken} />
    </AuthCard>
  )
}
