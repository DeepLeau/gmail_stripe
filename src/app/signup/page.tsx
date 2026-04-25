export const dynamic = 'force-dynamic'

import { AuthCard } from '@/components/auth/AuthCard'
import { SignupForm } from '@/components/auth/SignupForm'
import { SignupPrompt } from '@/components/sections/SignupPrompt'

interface SignupPageProps {
  searchParams: Promise<{ session_id?: string; plan_name?: string; messages_limit?: string }>
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams
  const sessionId = params.session_id ?? null
  const planName = params.plan_name ?? null
  const messagesLimit = params.messages_limit ? parseInt(params.messages_limit, 10) : null

  return (
    <AuthCard
      title="Créer un compte"
      altLinkLabel="Déjà un compte ? Se connecter"
      altLinkHref="/login"
    >
      <SignupPrompt sessionId={sessionId} planName={planName} messagesLimit={messagesLimit} />
      <SignupForm sessionId={sessionId} />
    </AuthCard>
  )
}
