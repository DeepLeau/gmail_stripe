'use client'

import { useSignupWithStripeLinking } from '@/lib/stripe/hooks/useSignupWithStripeLinking'

type SignupFormState = {
  status: 'idle' | 'loading' | 'linking' | 'error' | 'password_mismatch'
  errorMessage?: string
  fieldErrors?: {
    email?: string
    password?: string
    confirmPassword?: string
  }
}

interface SignupFormProps {
  pendingSessionId?: string
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 6

export function SignupForm({ pendingSessionId }: SignupFormProps) {
  const { status, errorMessage, signup } = useSignupWithStripeLinking({
    pendingSessionId,
    redirectTo: '/chat',
  })

  const isLoading = status === 'signing_up' || status === 'linking'

  // Local UI state for form fields
  // (hooks client-side only, safe to manage here)
  let emailValue = ''
  let passwordValue = ''
  let confirmPasswordValue = ''
  let setEmail: (v: string) => void = () => {}
  let setPassword: (v: string) => void = () => {}
  let setConfirmPassword: (v: string) => void = () => {}
  let validate: () => boolean = () => true
  let handleSubmit: (e: React.FormEvent) => void = () => {}

  // Use React.useState requires making this a proper hook usage
  // Since we can't use hooks outside of component body, we use the hook above
  // and for the form fields we use inline state managed by the parent via controlled inputs pattern.
  // For simplicity, we use uncontrolled inputs here — the form is submitted via ref.
  // The hook above handles the signup + linking flow.

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement)?.value ?? ''
        const password = (e.currentTarget.elements.namedItem('password') as HTMLInputElement)?.value ?? ''
        const confirmPassword = (e.currentTarget.elements.namedItem('confirmPassword') as HTMLInputElement)?.value ?? ''

        // Inline validation
        const fieldErrors: SignupFormState['fieldErrors'] = {}
        if (!email.trim()) {
          fieldErrors.email = "L'adresse email est requise"
        } else if (!EMAIL_REGEX.test(email.trim())) {
          fieldErrors.email = 'Adresse email invalide'
        }
        if (!password) {
          fieldErrors.password = 'Le mot de passe est requis'
        } else if (password.length < MIN_PASSWORD_LENGTH) {
          fieldErrors.password = `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères`
        }
        if (!confirmPassword) {
          fieldErrors.confirmPassword = 'La confirmation est requise'
        } else if (password !== confirmPassword) {
          fieldErrors.confirmPassword = 'Les mots de passe ne correspondent pas'
          alert('Les mots de passe ne correspondent pas')
          return
        }

        if (Object.keys(fieldErrors).length > 0) {
          alert(Object.values(fieldErrors).filter(Boolean).join('\n'))
          return
        }

        signup(email, password)
      }}
      noValidate
      className="flex flex-col gap-4"
    >
      {/* Champ email */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-[var(--text-2)]">
          Adresse email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          disabled={isLoading}
          placeholder="vous@exemple.com"
          className="h-10 px-3 rounded-lg text-sm transition-colors duration-150
                     bg-[var(--bg)] border text-[var(--text)] placeholder:text-[var(--text-3)]
                     focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20
                     disabled:opacity-50 disabled:cursor-not-allowed
                     border-[var(--border-md)] focus:border-[var(--accent)]"
        />
      </div>

      {/* Champ mot de passe */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-[var(--text-2)]">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          disabled={isLoading}
          placeholder="Minimum 6 caractères"
          className="h-10 px-3 rounded-lg text-sm transition-colors duration-150
                     bg-[var(--bg)] border text-[var(--text)] placeholder:text-[var(--text-3)]
                     focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20
                     disabled:opacity-50 disabled:cursor-not-allowed
                     border-[var(--border-md)] focus:border-[var(--accent)]"
        />
      </div>

      {/* Champ confirmation mot de passe */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-[var(--text-2)]">
          Confirmer le mot de passe
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          disabled={isLoading}
          placeholder="••••••••"
          className="h-10 px-3 rounded-lg text-sm transition-colors duration-150
                     bg-[var(--bg)] border text-[var(--text)] placeholder:text-[var(--text-3)]
                     focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20
                     disabled:opacity-50 disabled:cursor-not-allowed
                     border-[var(--border-md)] focus:border-[var(--accent)]"
        />
      </div>

      {/* Message d'erreur global */}
      {status === 'error' && errorMessage && (
        <p className="text-sm text-[var(--red)] text-center py-2 px-3 rounded-lg bg-[var(--red)]/5 border border-[var(--red)]/15">
          {errorMessage}
        </p>
      )}

      {/* Message de statut linking */}
      {status === 'linking' && (
        <p className="text-sm text-[var(--accent)] text-center py-2 px-3 rounded-lg bg-[var(--accent)]/5 border border-[var(--accent)]/15 flex items-center justify-center gap-2">
          <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Activation de votre abonnement...
        </p>
      )}

      {/* Bouton submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="h-10 px-4 flex items-center justify-center gap-2 rounded-lg
                   bg-[var(--accent)] hover:bg-[var(--accent-hi)] text-white
                   text-sm font-medium transition-colors duration-150
                   disabled:opacity-60 disabled:cursor-not-allowed mt-1"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>{status === 'linking' ? 'Activation...' : 'Création...'}</span>
          </>
        ) : (
          <span>Créer un compte</span>
        )}
      </button>
    </form>
  )
}
