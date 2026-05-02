'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { linkStripeSessionToUser } from '@/app/actions/auth'

type SuccessViewState =
  | { status: 'idle' }
  | { status: 'loading_signup' }
  | { status: 'loading_link' }
  | { status: 'redirecting' }
  | { status: 'error'; message: string }

type SuccessViewProps = {
  sessionId: string
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 6

export function SuccessView({ sessionId }: SuccessViewProps) {
  const router = useRouter()
  const [state, setState] = useState<SuccessViewState>({ status: 'idle' })
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
    password?: string
    confirmPassword?: string
  }>({})

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
      return false
    }
    return true
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setState({ status: 'loading_signup' })

    const supabase = createClient()
    if (!supabase) {
      setState({ status: 'error', message: 'Service temporairement indisponible' })
      return
    }

    // 1. Create the account
    const { error: signupError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    })

    if (signupError) {
      const message =
        signupError.message === 'User already registered'
          ? 'Un compte existe déjà avec cet email'
          : "Une erreur est survenue lors de la création du compte"
      setState({ status: 'error', message })
      return
    }

    // 2. Link the Stripe session to the newly created user
    setState({ status: 'loading_link' })
    const linkResult = await linkStripeSessionToUser(sessionId)

    if (!linkResult.success) {
      setState({
        status: 'error',
        message: linkResult.error ?? 'Erreur lors de la liaison du paiement',
      })
      return
    }

    // 3. Redirect to chat
    setState({ status: 'redirecting' })
    router.push('/chat')
  }

  const isLoadingSignup = state.status === 'loading_signup'
  const isLoadingLink = state.status === 'loading_link'
  const isRedirecting = state.status === 'redirecting'
  const isError = state.status === 'error'
  const isAnyLoading = isLoadingSignup || isLoadingLink || isRedirecting

  return (
    <div className="flex flex-col gap-6">
      {/* Step 1 — Paiement confirmé */}
      <div
        className="flex items-start gap-3 px-4 py-3 rounded-xl"
        style={{
          backgroundColor: 'rgba(74, 222, 128, 0.08)',
          border: '1px solid rgba(74, 222, 128, 0.2)',
        }}
      >
        <CheckCircle2
          size={20}
          strokeWidth={1.5}
          className="shrink-0 mt-0.5"
          style={{ color: 'var(--green)' }}
        />
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--green)' }}>
            Paiement confirmé ✅
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
            Votre abonnement est actif. Créez votre compte ci-dessous pour y accéder.
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
        <span className="text-xs" style={{ color: 'var(--text-3)' }}>
          Créer mon compte
        </span>
        <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
      </div>

      {/* Step 2 — Formulaire inscription */}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-[var(--text-2)]">
            Adresse email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setFieldErrors((f) => ({ ...f, email: undefined }))
            }}
            disabled={isAnyLoading}
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

        {/* Mot de passe */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium text-[var(--text-2)]">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setFieldErrors((f) => ({ ...f, password: undefined }))
            }}
            disabled={isAnyLoading}
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

        {/* Confirmation mot de passe */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-[var(--text-2)]">
            Confirmer le mot de passe
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              setFieldErrors((f) => ({ ...f, confirmPassword: undefined }))
            }}
            disabled={isAnyLoading}
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
        {isError && (
          <p className="text-sm text-[var(--red)] text-center py-2 px-3 rounded-lg bg-[var(--red)]/5 border border-[var(--red)]/15">
            {state.message}
          </p>
        )}

        {/* État redirection */}
        {isRedirecting && (
          <p className="text-sm text-center py-2" style={{ color: 'var(--text-3)' }}>
            Création de votre compte... ⏳
          </p>
        )}

        {/* Bouton submit */}
        <button
          type="submit"
          disabled={isAnyLoading}
          className="h-10 px-4 flex items-center justify-center gap-2 rounded-lg
                     bg-[var(--accent)] hover:bg-[var(--accent-hi)] text-white
                     text-sm font-medium transition-colors duration-150
                     disabled:opacity-60 disabled:cursor-not-allowed mt-1"
        >
          {isLoadingSignup ? (
            <>
              <Loader2 size={15} className="animate-spin shrink-0" />
              <span>Création du compte...</span>
            </>
          ) : isLoadingLink ? (
            <>
              <Loader2 size={15} className="animate-spin shrink-0" />
              <span>Activation de l&apos;abonnement...</span>
            </>
          ) : (
            <span>Créer mon compte et accéder à Emind</span>
          )}
        </button>
      </form>
    </div>
  )
}
