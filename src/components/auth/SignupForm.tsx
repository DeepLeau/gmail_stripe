'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { linkStripeSessionToUser } from '@/app/actions/subscription'

type SignupFormState = 'idle' | 'signing_up' | 'linking' | 'error'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 6

export function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id') ?? undefined

  const [state, setState] = useState<SignupFormState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
    password?: string
    confirmPassword?: string
  }>({})
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const isLoading = state === 'signing_up' || state === 'linking'

  function validate(): boolean {
    const errors: typeof fieldErrors = {}

    if (!email.trim()) {
      errors.email = "L'adresse email est requise"
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
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setState('error')
      return false
    }

    return true
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!validate()) return

    setState('signing_up')
    setErrorMessage(null)

    const supabase = createClient()
    if (!supabase) {
      setState('error')
      setErrorMessage('Service temporairement indisponible')
      return
    }

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    })

    if (error) {
      const message = error.message === 'User already registered'
        ? 'Un compte existe déjà avec cet email'
        : 'Une erreur est survenue lors de la création du compte'
      setState('error')
      setErrorMessage(message)
      return
    }

    // Si aucune session Stripe à lier, aller directement au chat
    if (!sessionId) {
      router.push('/chat')
      return
    }

    // Lier la session Stripe avec retry + backoff
    setState('linking')
    const linkResult = await linkStripeSessionToUser(sessionId)

    if (!linkResult.success) {
      setState('error')
      setErrorMessage(linkResult.error ?? 'Impossible de finaliser votre abonnement. Contactez le support.')
      return
    }

    router.push('/chat')
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
        {state === 'error' && fieldErrors.email && (
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
        {state === 'error' && fieldErrors.password && (
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
        {(state === 'error' || state === 'idle') && fieldErrors.confirmPassword && (
          <p className="text-xs text-[var(--red)] flex items-center gap-1">
            {fieldErrors.confirmPassword}
          </p>
        )}
      </div>

      {/* Message d'état linking (après sign-up réussi, avant redirect) */}
      {state === 'linking' && (
        <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg
                        bg-blue-50 border border-blue-200 text-sm text-blue-700">
          <Loader2 size={14} className="animate-spin shrink-0" />
          <span>Création de votre abonnement...</span>
        </div>
      )}

      {/* Message d'erreur global */}
      {state === 'error' && !fieldErrors.email && !fieldErrors.password && !fieldErrors.confirmPassword && errorMessage && (
        <p className="text-sm text-[var(--red)] text-center py-2 px-3 rounded-lg bg-[var(--red)]/5 border border-[var(--red)]/15">
          {errorMessage}
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
        {state === 'signing_up' ? (
          <>
            <Loader2 size={15} className="animate-spin shrink-0" />
            <span>Création en cours...</span>
          </>
        ) : state === 'linking' ? (
          <>
            <Loader2 size={15} className="animate-spin shrink-0" />
            <span>Activation...</span>
          </>
        ) : (
          <span>Créer un compte</span>
        )}
      </button>
    </form>
  )
}
