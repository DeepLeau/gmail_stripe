export const dynamic = 'force-dynamic'

import { AuthCard } from '@/components/auth/AuthCard'
import { SignupForm } from '@/components/auth/SignupForm'

interface SignupPageProps {
  searchParams: Promise<{ session_id?: string }>
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams
  const stripeSessionId = params.session_id

  return (
    <>
      {/* Session confirmation banner — shown when user arrives from Stripe Checkout */}
      {stripeSessionId && (
        <div className="mb-6 px-4 py-3 rounded-lg border text-sm flex items-center gap-2"
          style={{
            backgroundColor: 'var(--green-light, #f0fdf4)',
            borderColor: 'var(--green-border, #bbf7d0)',
            color: 'var(--green-text, #15803d)',
          }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M5 8.5L7 10.5L11 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Votre plan a bien été sélectionné
        </div>
      )}

      <AuthCard
        title="Créer un compte"
        altLinkLabel="Déjà un compte ? Se connecter"
        altLinkHref="/login"
      >
        <SignupForm stripeSessionId={stripeSessionId} />
      </AuthCard>
    </>
  )
}
