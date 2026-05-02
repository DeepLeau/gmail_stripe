'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useSignupWithStripeLinking } from '@/lib/stripe/hooks/useSignupWithStripeLinking'

type FieldErrors = {
  email?: string
  password?: string
  confirmPassword?: string
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 6

interface SignupFormProps {
  pendingSessionId?: string
}

export function SignupForm({ pendingSessionId }: SignupFormProps) {
  const { status, errorMessage, signup } = useSignupWithStripeLinking({ pendingSessionId })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const isLoading = status === 'signing_up' || status === 'linking'

  function validate(): boolean {
    const errors: FieldErrors = {}

    if (!email.trim()) {
      errors.email = 'L\'adresse email est requise'
    } else if (!EMAIL_REGEX.test(email.trim())) {
      errors.email = 'Adresse email invalide'
    }

    if (!password) {
      errors.password = 'Le mot de passe est requis'
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      errors.password = `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères`
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'La confirmation est requise'
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas'
      setFieldErrors(errors)
      return false
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return false
    }

    return true
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFieldErrors({})

    if (!validate()) return

    await signup(email.trim(), password)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {/* Champ email */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-[var(--text-2)]">
          Adresse email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          placeholder="vous@exemple.com"
          className="h-10 px-3 rounded-lg text-sm transition-colors duration-150
                     bg-[var(--bg)] border text-[var(--text)] placeholder:text-[var(--text-3)]
                     focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20
                     disabled:opacity-50 disabled:cursor-not-allowed
                     border-[var(--border-md)] focus:border-[var(--accent)]"
        />
        {fieldErrors.email && (
          <p className="text-xs text-[var(--red)] flex items-center gap-1">
            {fieldErrors.email}
          </p>
        )}
      </div>

      {/* Champ mot de passe */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-[var(--text-2)]">
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          placeholder="Minimum 6 caractères"
          className="h-10 px-3 rounded-lg text-sm transition-colors duration-150
                     bg-[var(--bg)] border text-[var(--text)] placeholder:text-[var(--text-3)]
                     focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20
                     disabled:opacity-50 disabled:cursor-not-allowed
                     border-[var(--border-md)] focus:border-[var(--accent)]"
        />
        {fieldErrors.password && (
          <p className="text-xs text-[var(--red)] flex items-center gap-1">
            {fieldErrors.password}
          </p>
        )}
      </div>

      {/* Champ confirmation mot de passe */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-[var(--text-2)]">
          Confirmer le mot de passe
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isLoading}
          placeholder="••••••••"
          className="h-10 px-3 rounded-lg text-sm transition-colors duration-150
                     bg-[var(--bg)] border text-[var(--text)] placeholder:text-[var(--text-3)]
                     focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20
                     disabled:opacity-50 disabled:cursor-not-allowed
                     border-[var(--border-md)] focus:border-[var(--accent)]"
        />
        {fieldErrors.confirmPassword && (
          <p className="text-xs text-[var(--red)] flex items-center gap-1">
            {fieldErrors.confirmPassword}
          </p>
        )}
      </div>

      {/* Message d'erreur global */}
      {status === 'error' && !fieldErrors.confirmPassword && errorMessage && (
        <p className="text-sm text-[var(--red)] text-center py-2 px-3 rounded-lg bg-[var(--red)]/5 border border-[var(--red)]/15">
          {errorMessage}
        </p>
      )}

      {/* Message de linking */}
      {status === 'linking' && (
        <p className="text-sm text-[var(--accent)] text-center py-2 px-3 rounded-lg bg-[var(--accent)]/5 border border-[var(--accent)]/15">
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
        {status === 'signing_up' ? (
          <>
            <Loader2 size={15} className="animate-spin shrink-0" />
            <span>Création en cours...</span>
          </>
        ) : status === 'linking' ? (
          <>
            <Loader2 size={15} className="animate-spin shrink-0" />
            <span>Activation de votre abonnement...</span>
          </>
        ) : (
          <span>Créer un compte</span>
        )}
      </button>
    </form>
  )
}