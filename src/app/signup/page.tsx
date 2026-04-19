import { type Metadata } from 'next'
import { SignupForm } from '@/components/auth/SignupForm'

export const metadata: Metadata = {
  title: 'Créer un compte — Emind',
  description: 'Créez votre compte Emind et commencez à automatiser vos réponses email.',
}

export const dynamic = 'force-dynamic'

interface SignupPageProps {
  searchParams: Promise<{
    session_id?: string
    plan_id?: string
    redirectTo?: string
  }>
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
      <SignupForm
        selectedPlanId={params.plan_id}
        stripeSessionId={params.session_id}
        redirectTo={params.redirectTo}
      />
    </div>
  )
}
