export const dynamic = 'force-dynamic'

import { AuthCard } from '@/components/auth/AuthCard'
import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <AuthCard
      title="Connexion"
      altLinkLabel="Pas encore de compte ? Créer un compte"
      altLinkHref="/signup"
    >
      <LoginForm />
    </AuthCard>
  )
}
