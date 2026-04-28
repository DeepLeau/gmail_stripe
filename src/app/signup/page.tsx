export const dynamic = 'force-dynamic'

import { AuthCard } from '@/components/auth/AuthCard'
import { SignupForm } from '@/components/auth/SignupForm'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

interface SignupPageProps {
  searchParams: Promise<{ checkout_session?: string }>
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams
  const sessionId = params.checkout_session

  // If we have a checkout session, attempt linking
  if (sessionId) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Only attempt linking if user is now authenticated (signup succeeded)
    if (user) {
      try {
        const linkRes = await fetch(new URL('/api/checkout/link', process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000').toString(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        })

        if (linkRes.ok) {
          const linkData = await linkRes.json()
          if (linkData.success) {
            // Redirect to chat with welcome message as search param
            redirect(`/chat?welcome=1&plan=${encodeURIComponent(linkData.plan ?? '')}`)
          }
        }
        // If linking fails, continue to show the signup form
        // The user will see the signup form, and the checkout will be pending
        // They can sign up and we'll try linking again
      } catch {
        // Link failed silently - user can still sign up
        // The pending checkout will be linked via webhook or next attempt
      }
    }
  }

  return (
    <AuthCard
      title="Créer un compte"
      altLinkLabel="Déjà un compte ? Se connecter"
      altLinkHref="/login"
    >
      <SignupForm />
    </AuthCard>
  )
}
