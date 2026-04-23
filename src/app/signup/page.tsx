export const dynamic = 'force-dynamic'

import { AuthCard } from '@/components/auth/AuthCard'
import { SignupForm } from '@/components/auth/SignupForm'
import { PaymentBanner } from '@/components/payment/PaymentBanner'

export default function SignupPage() {
  return (
    <>
      <PaymentBanner variant="signup" />
      <AuthCard
        title="Créer un compte"
        altLinkLabel="Déjà un compte ? Se connecter"
        altLinkHref="/login"
      >
        <SignupForm />
      </AuthCard>
    </>
  )
}
