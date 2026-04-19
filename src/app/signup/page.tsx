export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { AuthCard } from '@/components/auth/AuthCard'
import { SignupForm } from '@/components/auth/SignupForm'
import { Loader2 } from 'lucide-react'

interface SignupPageProps {
  searchParams: Promise<{
    plan?: string
    session_id?: string
  }>
}

async function SignupContent({ plan }: { plan: string | undefined }) {
  return <SignupForm plan={plan} />
}

function SignupLoading() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 size={24} className="animate-spin" style={{ color: 'var(--text-2)' }} />
    </div>
  )
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams
  const plan = params.plan
  const sessionId = params.session_id

  return (
    <AuthCard
      title="Créer un compte"
      altLinkLabel="Déjà un compte ? Se connecter"
      altLinkHref="/login"
    >
      <Suspense fallback={<SignupLoading />}>
        <SignupContent plan={plan} />
      </Suspense>
      {sessionId && plan && (
        <div
          className="mt-4 px-4 py-3 rounded-lg text-sm text-center"
          style={{
            backgroundColor: 'var(--accent-glow)',
            border: '1px solid var(--accent)',
            color: 'var(--accent-hi)',
          }}
        >
          <p className="font-medium">
            Plan {plan.charAt(0).toUpperCase() + plan.slice(1)} sélectionné
          </p>
          <p className="text-xs mt-0.5 opacity-80">
            Ton abonnement sera activé après la création du compte.
          </p>
        </div>
      )}
    </AuthCard>
  )
}
