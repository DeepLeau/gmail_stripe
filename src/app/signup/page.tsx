import { Suspense } from 'react'
import { AuthCard } from '@/components/auth/AuthCard'
import { SignupForm } from '@/components/auth/SignupForm'
import { Loader2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

function SignupLoading() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 size={20} className="animate-spin" style={{ color: 'var(--text-3)' }} />
    </div>
  )
}

interface SignupPageProps {
  searchParams: Promise<{ session_id?: string; plan_id?: string }>
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams
  const sessionId = params.session_id
  const planId = params.plan_id

  const hasStripeSession = !!sessionId && !!planId

  return (
    <AuthCard
      title={hasStripeSession ? 'Finaliser votre inscription' : 'Créer un compte'}
      altLinkLabel="Déjà un compte ? Se connecter"
      altLinkHref="/login"
    >
      <Suspense fallback={<SignupLoading />}>
        <SignupForm sessionId={sessionId} planId={planId} />
      </Suspense>
    </AuthCard>
  )
}
