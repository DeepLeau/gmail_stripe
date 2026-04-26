export const dynamic = 'force-dynamic'

import { AuthCard } from '@/components/auth/AuthCard'
import { SignupForm } from '@/components/auth/SignupForm'
import { headers } from 'next/headers'

interface SignupPageProps {
  searchParams: Promise<{
    session_id?: string
    plan?: string
  }>
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams
  const sessionId = params.session_id
  const planName = params.plan

  return (
    <AuthCard
      title="Créer un compte"
      altLinkLabel="Déjà un compte ? Se connecter"
      altLinkHref="/login"
      sessionId={sessionId}
      planName={planName}
    >
      <SignupForm defaultEmail={undefined} />
    </AuthCard>
  )
}
