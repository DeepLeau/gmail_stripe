'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useSignupWithStripeLinking } from '@/lib/stripe/hooks/useSignupWithStripeLinking'

type SignupFormState = {
  status: 'idle' | 'loading' | 'error' | 'password_mismatch'
  errorMessage?: string
  fieldErrors?: {
    email?: string
    password?: string
    confirmPassword?: string
  }
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 6

interface SignupFormProps {
  sessionId?: string
}

export function SignupForm({ sessionId }: SignupFormProps) {
  const { status, errorMessage, signup } = useSignupWithStripeLinking({
    pendingSessionId: sessionId,
    redirectTo: '/chat',
  })
  const [state, setState] = useState<SignupFormState>({ status: 'idle' })
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const isLoading = state.status === 'loading' || status === 'signing_up' || status === 'linking'

  function validate(): boolean {
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

    if (password && confirmPassword && password !== confirmPassword) {
      fieldErrors.confirmPassword = 'Les mots de passe ne correspondent pas'
      setState({ status: 'password_mismatch', fieldErrors })
      return false
    }

    if (!confirmPassword) {
      fieldErrors.confirmPassword = 'La confirmation est requise'
    } else if (password !== confirmPassword) {
      fieldErrors.confirmPassword = 'Les mots de passe ne correspondent pas'
      setState({ status: 'password_mismatch', fieldErrors })
      return false
    }

    if (Object.keys(fieldErrors).length > 0) {
      setState({ status: 'error', fieldErrors })
      return false
    }

    return true
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!validate()) return

    setState({ status: 'loading' })

    const result = await signup(email, password)

    if (!result.ok) {
      const message = result.error?.toLowerCase().includes('already')
        ? 'Un compte existe déjà avec cet email'
        : 'Une erreur est survenue lors de la création du compte'
      setState({ status: 'error', errorMessage: message })
      return
    }

    // Redirect is handled by the hook via router.push(redirectTo)
    // No manual redirect needed here
  }

  // Display hook-level error only when form state is idle (hook handles its own error display)
  const hookError = (status === 'error' || status === 'linking') && errorMessage ? errorMessage : null
  const formError = state.status === 'error' && !hookError ? state.errorMessage : null

    return (
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {/* Email field */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-[var(--text)]">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            placeholder="vous@exemple.com"
            autoComplete="email"
            className="h-10 px-3 rounded-lg bg-[var(--bg-2)] border border-[var(--border)]
                       text-sm text-[var(--text)] placeholder:text-[var(--muted)]
                       focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]
                       disabled:opacity-60 disabled:cursor-not-allowed"
          />
          {state.fieldErrors?.email && (
            <p className="text-xs text-red-500">{state.fieldErrors.email}</p>
          )}
        </div>

        {/* Password field */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium text-[var(--text)]">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            placeholder="Minimum 6 caractères"
            autoComplete="new-password"
            className="h-10 px-3 rounded-lg bg-[var(--bg-2)] border border-[var(--border)]
                       text-sm text-[var(--text)] placeholder:text-[var(--muted)]
                       focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]
                       disabled:opacity-60 disabled:cursor-not-allowed"
          />
          {state.fieldErrors?.password && (
            <p className="text-xs text-red-500">{state.fieldErrors.password}</p>
          )}
        </div>

        {/* Confirm password field */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-[var(--text)]">
            Confirmer le mot de passe
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            placeholder="Confirmez votre mot de passe"
            autoComplete="new-password"
            className="h-10 px-3 rounded-lg bg-[var(--bg-2)] border border-[var(--border)]
                       text-sm text-[var(--text)] placeholder:text-[var(--muted)]
                       focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]
                       disabled:opacity-60 disabled:cursor-not-allowed"
          />
          {state.fieldErrors?.confirmPassword && (
            <p className="text-xs text-red-500">{state.fieldErrors.confirmPassword}</p>
          )}
        </div>

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
              <Loader2 size={15} className="animate-spin shrink-0" />
              <span>Création en cours...</span>
            </>
          ) : (
            <span>Créer un compte</span>
          )}
        </button>
      </form>
    )
}
