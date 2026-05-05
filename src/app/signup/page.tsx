import { Suspense } from 'react'
import { AuthCard } from '@/components/auth/AuthCard'
import { SignupPageClient } from '@/components/auth/SignupPageClient'

export const dynamic = 'force-dynamic'

export default function SignupPage() {
  return (
    <AuthCard
      title="Créer un compte"
      altLinkLabel="Déjà un compte ? Se connecter"
      altLinkHref="/login"
    >
      <Suspense fallback={null}>
        <SignupPageClient />
      </Suspense>
    </AuthCard>
  )
}
