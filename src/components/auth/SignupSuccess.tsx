'use client'

import { useRouter } from 'next/navigation'
import { CheckCircle, Mail, ArrowRight } from 'lucide-react'

interface SignupSuccessProps {
  email?: string
}

export function SignupSuccess({ email }: SignupSuccessProps) {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center text-center gap-6 py-4">
      {/* Success Icon */}
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
          <CheckCircle size={40} className="text-green-500" />
        </div>
      </div>

      {/* Title */}
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-[var(--text)]">
          Compte créé avec succès !
        </h2>
        <p className="text-[var(--text-2)] text-sm">
          Bienvenue{email ? `, ${email}` : ''} !
        </p>
      </div>

      {/* Email Confirmation Notice */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-[var(--accent)]/5 border border-[var(--accent)]/15 w-full max-w-sm">
        <Mail size={18} className="shrink-0 mt-0.5 text-[var(--accent)]" />
        <div className="text-left">
          <p className="text-sm font-medium text-[var(--text)]">
            Email de confirmation
          </p>
          <p className="text-xs text-[var(--text-3)] mt-1">
            Un email de confirmation a été envoyé. Vérifiez votre boîte de réception et cliquez sur le lien pour activer votre compte.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full max-w-sm mt-2">
        <button
          onClick={() => router.push('/chat')}
          className="h-11 px-6 flex items-center justify-center gap-2 rounded-lg
                     bg-[var(--accent)] hover:bg-[var(--accent-hi)] text-white
                     text-sm font-medium transition-colors duration-150"
        >
          <span>Aller au chat</span>
          <ArrowRight size={16} />
        </button>

        <p className="text-xs text-[var(--text-3)]">
          Vous pourrez accéder à toutes les fonctionnalités une fois votre email confirmé.
        </p>
      </div>
    </div>
  )
}
