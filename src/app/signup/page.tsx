export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { AuthCard } from '@/components/auth/AuthCard'
import { SignupFormWithLinking } from '@/components/auth/SignupFormWithLinking'

export default function SignupPage() {
  return (
    <AuthCard
      title="Créer un compte"
      altLinkLabel="Déjà un compte ? Se connecter"
      altLinkHref="/login"
    >
      <Suspense fallback={null}>
        <SignupFormWithLinking />
      </Suspense>
    </AuthCard>
  )
}
