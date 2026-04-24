import { SignupForm } from '@/components/auth/SignupForm'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const params = await searchParams
  const sessionId = params.session_id

  // If user already authenticated, redirect directly to chat
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) {
    redirect('/chat')
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--surface)' }}>
      <div className="w-full max-w-md">
        {/* Success icon */}
        <div className="flex justify-center mb-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--accent), var(--violet))',
              boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)',
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1
          className="text-2xl font-semibold text-center mb-2"
          style={{ color: 'var(--text)', letterSpacing: '-0.025em' }}
        >
          Paiement confirmé
        </h1>
        <p
          className="text-sm text-center mb-8"
          style={{ color: 'var(--text-2)', lineHeight: 1.6 }}
        >
          Ton compte est prêt. Configure ton profil pour accéder à Emind.
        </p>

        {/* Signup form */}
        <div
          className="rounded-2xl p-6 shadow-lg"
          style={{
            backgroundColor: 'var(--bg)',
            border: '1px solid var(--border)',
          }}
        >
          <SignupForm />
        </div>

        {/* Hidden session_id passed via URL for Stripe linking */}
      </div>
    </main>
  )
}
