import type { Metadata } from 'next'
import { AuthCard } from '@/components/auth/AuthCard'
import { SignupForm } from '@/components/auth/SignupForm'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

type SearchParams = Promise<{ session_id?: string }>

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams
}): Promise<Metadata> {
  const { session_id } = await searchParams
  if (session_id) {
    return {
      title: 'Confirmer votre inscription — Emind',
    }
  }
  return { title: 'Créer un compte — Emind' }
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { session_id } = await searchParams

  return (
    <AuthCard
      title="Créer un compte"
      altLinkLabel="Déjà un compte ? Se connecter"
      altLinkHref="/login"
    >
      <SignupForm sessionId={session_id} />
    </AuthCard>
  )
}
