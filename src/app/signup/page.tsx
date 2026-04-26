export const dynamic = 'force-dynamic'

import { AuthCard } from '@/components/auth/AuthCard'
import { SignupForm } from '@/components/auth/SignupForm'

interface SearchParams {
  session_id?: string
}

export default async function SignupPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const resolved = await searchParams
  const sessionId = resolved.session_id

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
