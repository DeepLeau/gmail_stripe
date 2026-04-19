'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

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

type SignupFormProps = {
  /** Stripe session_id passé depuis la page signup via query param */
  sessionId?: string | null
  /** Plan name déduit du session_id pour affichage dans le CTA */
  planPreview?: string | null
}

export function SignupForm({ sessionId, planPreview }: SignupFormProps) {
  const router = useRouter()
  const [state, setState] = useState<SignupFormState>({ status: 'idle' })
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const isLoading = state.status === 'loading'
  const isPostCheckout = !!sessionId

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

    const supabase = createClient()
    if (!supabase) {
      setState({ status: 'error', errorMessage: 'Service temporairement indisponible' })
      return
    }

    // --- Post-checkout flow: créer le compte puis confirmer la session Stripe ---
    if (isPostCheckout && sessionId) {
      try {
        // Créer le compte d'abord
        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        })

        if (signUpError) {
          const message =
            signUpError.message === 'User already registered'
              ? 'Un compte existe déjà avec cet email'
              : "Une erreur est survenue lors de la création du compte"
          setState({ status: 'error', errorMessage: message })
          return
        }

        // Confirmer la session Stripe côté serveur pour lier le plan
        const confirmRes = await fetch('/api/stripe/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        })

        if (!confirmRes.ok) {
          const err = await confirmRes.json().catch(() => ({}))
          if (err.error === 'invalid_session' || err.error === 'session_expired') {
            setState({
              status: 'error',
              errorMessage:
                "La session de paiement a expiré. Retourne sur la page des tarifs pour renouveler ton inscription.",
            })
            return
          }
          if (err.error === 'session_already_used') {
            setState({
              status: 'error',
              errorMessage: 'Ce lien a déjà été utilisé. Connecte-toi avec ton email.',
            })
            return
          }
          setState({ status: 'error', errorMessage: "Une erreur est survenue. Connecte-toi pour accéder à ton compte." })
          return
        }

        // Redirection vers /chat après confirmation réussie
        router.push('/chat')
      } catch {
        setState({ status: 'error', errorMessage: 'Une erreur est survenue. Réessaie.' })
      }
      return
    }

    // --- Flow standard : signup sans plan (free tier) ---
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    })

    if (error) {
      const message =
        error.message === 'User already registered'
          ? 'Un compte existe déjà avec cet email'
          : "Une erreur est survenue lors de la création du compte"
      setState({ status: 'error', errorMessage: message })
      return
    }

    router.push('/chat')
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {/* Post-checkout notice */}
      {isPostCheckout && (
        <div
          className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-xs"
          style={{
            backgroundColor: 'var(--accent)',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(99,102,241,0.05) 100%)',
            border: '1px solid rgba(99,102,241,0.2)',
            color: 'var(--text-2)',
            lineHeight: 1.5,
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-0.5"
            style={{ backgroundColor: 'var(--accent-hi)' }}
          />
          <span>
            Tu t&apos;inscris avec le plan{' '}
            <strong style={{ color: 'var(--text-1)' }}>{planPreview ?? 'payant'}</strong>
            . Ton abonnement sera actif après la création du compte.
          </span>
        </div>
      )}

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
            {state.fieldErrors.confirmPassword}
          </p>
        )}
        {state.status === 'password_mismatch' && state.fieldErrors?.confirmPassword && (
          <p className="text-xs text-[var(--red)] flex items-center gap-1">
            {state.fieldErrors.confirmPassword}
          </p>
        )}
      </div>

      {/* Message d'erreur global */}
      {state.status === 'error' && !state.fieldErrors?.confirmPassword && state.errorMessage && (
        <p className="text-sm text-[var(--red)] text-center py-2 px-3 rounded-lg bg-[var(--red)]/5 border border-[var(--red)]/15">
          {state.errorMessage}
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
            <Loader2 size={15} className="animate-spin shrink-0" />
            <span>
              {isPostCheckout ? 'Création avec ton plan...' : 'Création en cours...'}
            </span>
          </>
        ) : (
          <span>{isPostCheckout ? 'Créer mon compte et activer mon plan' : 'Créer un compte'}</span>
        )}
      </button>
    </form>
  )
}
