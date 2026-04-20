'use client'

import { useState, type FormEvent } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type StripePlanName = 'start' | 'scale' | 'team'

type StripeSignupFormState = {
  status: 'idle' | 'loading' | 'redirecting' | 'error'
  errorMessage?: string
  fieldErrors?: {
    email?: string
    password?: string
    confirmPassword?: string
  }
}

const PLAN_LABELS: Record<StripePlanName, string> = {
  start: 'Start',
  scale: 'Scale',
  team: 'Team',
}

const PLAN_PRICES: Record<StripePlanName, string> = {
  start: '10 €',
  scale: '29 €',
  team: '59 €',
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 6

interface StripeSignupFormProps {
  plan: StripePlanName
}

export function StripeSignupForm({ plan }: StripeSignupFormProps) {
  const [state, setState] = useState<StripeSignupFormState>({ status: 'idle' })
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const isLoading = state.status === 'loading' || state.status === 'redirecting'

  function validate(): boolean {
    const fieldErrors: StripeSignupFormState['fieldErrors'] = {}

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
      setState({ status: 'error', fieldErrors })
      return false
    }

    if (Object.keys(fieldErrors).length > 0) {
      setState({ status: 'error', fieldErrors })
      return false
    }

    return true
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!validate()) return

    setState({ status: 'loading' })

    const supabase = createClient()
    if (!supabase) {
      setState({
        status: 'error',
        errorMessage: 'Service temporairement indisponible',
      })
      return
    }

    // Step 1: Create Supabase account (pending state)
    const { error: signupError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          plan,
        },
      },
    })

    if (signupError) {
      const message =
        signupError.message === 'User already registered'
          ? 'Un compte existe déjà avec cet email'
          : 'Une erreur est survenue lors de la création du compte'
      setState({ status: 'error', errorMessage: message })
      return
    }

    // Step 2: Create Stripe Checkout Session
    setState({ status: 'redirecting' })

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          plan,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setState({
          status: 'error',
          errorMessage: data.error ?? 'Impossible de créer la session de paiement',
        })
        return
      }

      // Redirect to Stripe Checkout — external URL requires window.location.href
      window.location.href = data.url
    } catch {
      setState({
        status: 'error',
        errorMessage: 'Connexion au serveur de paiement impossible',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {/* Plan badge */}
      <div className="flex items-center justify-center gap-2 mb-2">
        <span
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
          style={{
            backgroundColor: 'var(--accent-light)',
            color: 'var(--accent)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
          }}
        >
          Plan {PLAN_LABELS[plan]}
        </span>
        <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
          {PLAN_PRICES[plan]} / mois
        </span>
      </div>

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
        {state.status === 'error' && state.fieldErrors?.email && (
          <p className="text-xs text-[var(--red)] flex items-center gap-1">
            <AlertCircle size={12} className="shrink-0" />
            {state.fieldErrors.email}
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
        {state.status === 'error' && state.fieldErrors?.password && (
          <p className="text-xs text-[var(--red)] flex items-center gap-1">
            <AlertCircle size={12} className="shrink-0" />
            {state.fieldErrors.password}
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
        {state.status === 'error' && state.fieldErrors?.confirmPassword && (
          <p className="text-xs text-[var(--red)] flex items-center gap-1">
            <AlertCircle size={12} className="shrink-0" />
            {state.fieldErrors.confirmPassword}
          </p>
        )}
      </div>

      {/* Message d'erreur global */}
      {state.status === 'error' && !state.fieldErrors?.confirmPassword && state.errorMessage && (
        <p className="text-sm text-[var(--red)] text-center py-2 px-3 rounded-lg bg-[var(--red)]/5 border border-[var(--red)]/15 flex items-center justify-center gap-2">
          <AlertCircle size={14} className="shrink-0" />
          {state.errorMessage}
        </p>
      )}

      {/* Loading state */}
      {state.status === 'redirecting' && (
        <div className="flex flex-col items-center justify-center gap-2 py-3 px-3 rounded-lg bg-[var(--accent)]/5 border border-[var(--accent)]/20">
          <div className="flex items-center gap-2">
            <Loader2 size={14} className="animate-spin shrink-0" style={{ color: 'var(--accent)' }} />
            <span className="text-sm" style={{ color: 'var(--text-2)' }}>
              Redirection vers le paiement sécurisé...
            </span>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-3)' }}>
            Vous allez être redirigé vers Stripe Checkout
          </p>
        </div>
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
            <Loader2 size={15} className="animate-spin shrink-0" />
            <span>
              {state.status === 'redirecting'
                ? 'Préparation du paiement...'
                : 'Création du compte...'}
            </span>
          </>
        ) : (
          <span>Procéder au paiement</span>
        )}
      </button>

      {/* Sécurisé par Stripe */}
      <p className="text-center text-xs" style={{ color: 'var(--text-3)' }}>
        Paiement sécurisé par{' '}
        <span style={{ color: 'var(--accent)' }}>Stripe</span>
      </p>
    </form>
  )
}
