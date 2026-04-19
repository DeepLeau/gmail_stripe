export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getStripe } from '@/lib/stripe/config'
import { SignupFormWithPlan } from '@/components/auth/SignupFormWithPlan'

const PLAN_LABELS: Record<string, string> = {
  start: 'Start — 10 messages/mois',
  scale: 'Scale — 50 messages/mois',
  team: 'Team — 100 messages/mois',
}

export default async function CreateAccountPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; plan?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/chat')
  }

  const params = await searchParams
  const sessionId = params.session_id
  const planSlug = params.plan ?? 'start'

  let stripeCustomerEmail: string | undefined

  if (sessionId) {
    try {
      const stripe = getStripe()
      const session = await stripe.checkout.sessions.retrieve(sessionId)
      stripeCustomerEmail = session.customer_details?.email ?? undefined
    } catch {
      // Invalid session — continue without email
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-6 py-12"
      style={{ backgroundColor: 'var(--surface)' }}
    >
      {/* Background stripes */}
      <div className="fixed top-0 left-0 w-full flex flex-col">
        <div className="bg-[var(--accent)] w-full h-3" />
        <div className="h-3 w-full" style={{ backgroundColor: 'var(--warning)' }} />
        <div className="h-3 w-full" style={{ backgroundColor: 'var(--violet)' }} />
        <div className="bg-[var(--text)] w-full h-3" />
      </div>

      <div
        className="w-full max-w-md relative z-10 bg-white border-2 p-8"
        style={{
          borderColor: 'var(--border)',
          boxShadow: '8px 8px 0px 0px var(--violet)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-2 mb-8 pb-4"
          style={{ borderBottom: '2px solid var(--surface)' }}
        >
          <div
            className="w-8 h-8 rounded flex items-center justify-center text-white"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span
            className="text-2xl font-semibold tracking-tight"
            style={{
              fontFamily: 'var(--font-sans)',
              color: 'var(--text)',
            }}
          >
            Emind
          </span>
        </div>

        {/* Plan badge */}
        <div className="mb-6">
          <span
            className="inline-flex px-3 py-1 text-[11px] font-bold uppercase tracking-widest"
            style={{
              backgroundColor:
                planSlug === 'scale'
                  ? 'var(--accent)'
                  : planSlug === 'team'
                  ? 'var(--violet)'
                  : 'var(--warning)',
              color:
                planSlug === 'start' ? 'var(--text)' : '#ffffff',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {PLAN_LABELS[planSlug] ?? PLAN_LABELS.start}
          </span>
        </div>

        <h1
          className="text-2xl font-semibold tracking-tight mb-2"
          style={{
            fontFamily: 'var(--font-sans)',
            color: 'var(--text)',
          }}
        >
          Créer votre compte
        </h1>
        <p
          className="text-sm mb-6"
          style={{
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-2)',
          }}
        >
          {stripeCustomerEmail
            ? `Paiement validé pour ${stripeCustomerEmail}`
            : 'Rejoignez Emind et transformez vos conversations email.'}
        </p>

        <SignupFormWithPlan
          sessionId={sessionId}
          plan={planSlug}
          prefilledEmail={stripeCustomerEmail}
        />
      </div>
    </main>
  )
}
