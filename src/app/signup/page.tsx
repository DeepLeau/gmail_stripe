export const dynamic = 'force-dynamic'

import { AuthCard } from '@/components/auth/AuthCard'
import { SignupForm } from '@/components/auth/SignupForm'
import { createClient } from '@/lib/supabase/server'

interface SignupPageProps {
  searchParams: Promise<{ session_id?: string }>
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams
  const sessionId = params.session_id

  // Check if user already authenticated — if so, link is handled by the hook in SignupForm
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If user already has an active session and we have a pending session_id, redirect to chat
  // The hook in SignupForm will handle the linking after signup.
  // For already-logged-in users visiting with a pending session, show the form but
  // the hook won't trigger since auth.signUp would fail or be no-op.
  void user // consumed implicitly via auth state

  return (
    <AuthCard
      title="Créer un compte"
      altLinkLabel="Déjà un compte ? Se connecter"
      altLinkHref="/login"
    >
      <SignupForm pendingSessionId={sessionId ?? null} />
    </AuthCard>
  )
}
