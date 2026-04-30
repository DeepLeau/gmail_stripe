export const dynamic = 'force-dynamic'

import { AuthCard } from '@/components/auth/AuthCard'
import { SignupForm } from '@/components/auth/SignupForm'

interface SignupPageProps {
  searchParams: Promise<{ session_id?: string }>
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams
  const sessionId = params.session_id ?? null

  return (
    <AuthCard
      title="Créer un compte"
      altLinkLabel="Déjà un compte ? Se connecter"
      altLinkHref="/login"
    >
      <SignupForm sessionId={sessionId} />
    </AuthCard>
  )
}
