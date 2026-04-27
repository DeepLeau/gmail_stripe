export const dynamic = 'force-dynamic'

import { cookies } from 'next/headers'
import { AuthCard } from '@/components/auth/AuthCard'
import { SignupForm } from '@/components/auth/SignupForm'

interface PlanInfo {
  name: string
  amount: number
}

async function getSessionPlan(sessionId: string): Promise<PlanInfo | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const res = await fetch(
      `${baseUrl}/api/checkout/session?session_id=${encodeURIComponent(sessionId)}`,
      { cache: 'no-store' }
    )
    if (!res.ok) return null
    const data = await res.json()
    if (data.plan && data.amount !== undefined) {
      return { name: data.plan, amount: data.amount }
    }
    return null
  } catch {
    return null
  }
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const params = await searchParams
  const sessionId = params.session_id
  let selectedPlan: PlanInfo | null = null

  if (sessionId) {
    selectedPlan = await getSessionPlan(sessionId)

    // Store session_id in HttpOnly cookie for client-side access
    if (selectedPlan) {
      const cookieStore = await cookies()
      cookieStore.set('pending_checkout_session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60, // 1 hour
        path: '/',
      })
    }
  }

  return (
    <AuthCard
      title="Créer un compte"
      altLinkLabel="Déjà un compte ? Se connecter"
      altLinkHref="/login"
    >
      <SignupForm selectedPlan={selectedPlan} />
    </AuthCard>
  )
}
