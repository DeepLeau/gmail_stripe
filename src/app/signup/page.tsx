export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { AuthCard } from '@/components/auth/AuthCard'
import { SignupForm } from '@/components/auth/SignupForm'
import { createClient } from '@/lib/supabase/server'

interface SignupPageProps {
  searchParams: Promise<{ checkout_token?: string; success?: string }>
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams
  const supabase = await createClient()

  // Si déjà connecté, rediriger vers /chat
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) {
    redirect('/chat')
  }

  let pendingPlan: string | null = null
  const { checkout_token } = params

  // Si checkout_token présent : récupérer le plan associé
  if (checkout_token) {
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('plan_name')
      .eq('stripe_checkout_session_id', checkout_token)
      .eq('subscription_status', 'active')
      .maybeSingle()

    if (subscription?.plan_name) {
      pendingPlan = subscription.plan_name
    }
  }

  const title = pendingPlan
    ? 'Confirme ton compte'
    : 'Créer un compte'

  return (
    <AuthCard
      title={title}
      pendingPlan={pendingPlan}
      altLinkLabel="Déjà un compte ? Se connecter"
      altLinkHref="/login"
    >
      <SignupForm />
    </AuthCard>
  )
}
