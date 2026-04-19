'use client'

import { useState, useEffect } from 'react'
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

export function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const stripeSessionId = searchParams.get('session_id')

  const [state, setState] = useState<SignupFormState>({ status: 'idle' })
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [sessionLinked, setSessionLinked] = useState<boolean | null>(
    stripeSessionId ? null : false
  )

  const isLoading = state.status === 'loading'

  // Si un session_id Stripe est passé, vérifier si l'abonnement est déjà lié
  // (le webhook a pu already fire avant la création du compte)
  useEffect(() => {
    if (!stripeSessionId) return
    const supabase = createClient()
    if (!supabase) return

    // Vérifier si la session Stripe est déjà liée à un abonnement
    supabase
      .from('user_subscriptions')
      .select('user_id')
      .eq('stripe_session_id', stripeSessionId)
      .single()
      .then(({ data }) => {
        if (data?.user_id) {
          setSessionLinked(true)
        }
      })
  }, [stripeSessionId])

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
      setState({
        status: 'error',
        errorMessage: 'Service temporairement indisponible',
      })
      return
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    })

    if (authError) {
      const message =
        authError.message === 'User already registered'
          ? 'Un compte existe déjà avec cet email'
          : "Une erreur est survenue lors de la création du compte"
      setState({ status: 'error', errorMessage: message })
      return
    }

    // Lier l'abonnement Stripe si session_id présent
    if (authData.user && stripeSessionId) {
      // Si le webhook a déjà fire, la subscription existe déjà.
      // Sinon on met à jour stripe_session_id sur la row en attente.
      if (!sessionLinked) {
        await supabase
          .from('user_subscriptions')
          .update({ stripe_session_id: stripeSessionId })
          .eq('user_id', authData.user.id)
          .is('stripe_session_id', null)
          .order('created_at', { ascending: false })
          .limit(1)
      }
    }

    router.push('/chat')
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {/* Notice: plan sélectionnée avant inscription */}
      {stripeSessionId && (
        <div
          className="text-sm px-3 py-2.5 rounded-lg"
          style={{
            backgroundColor: 'rgba(99,102,241,0.08)',
            border: '1px solid rgba(99,102,241,0.20)',
            color: 'var(--accent-hi)',
          }}
        >
          Tu as sélectionné un plan payant. Termine ton inscription pour
          activer ton abonnement.
        </div>
      )}

      {/* Champ email */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="email"
          className="text-sm font-medium"
          style={{ color: 'var(--text-2)' }}
        >
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
          <p
            className="text-xs flex items-center gap-1"
            style={{ color: 'var(--red)' }}
          >
            {state.fieldErrors.email}
          </p>
        )}
      </div>

      {/* Champ mot de passe */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="password"
          className="text-sm font-medium"
          style={{ color: 'var(--text-2)' }}
        >
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
          <p
            className="text-xs flex items-center gap-1"
            style={{ color: 'var(--red)' }}
          >
            {state.fieldErrors.password}
          </p>
        )}
      </div>

      {/* Champ confirmation mot de passe */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="confirmPassword"
          className="text-sm font-medium"
          style={{ color: 'var(--text-2)' }}
        >
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
          <p
            className="text-xs flex items-center gap-1"
            style={{ color: 'var(--red)' }}
          >
            {state.fieldErrors.confirmPassword}
          </p>
        )}
        {state.status === 'password_mismatch' &&
          state.fieldErrors?.confirmPassword && (
            <p
              className="text-xs flex items-center gap-1"
              style={{ color: 'var(--red)' }}
            >
              {state.fieldErrors.confirmPassword}
            </p>
          )}
      </div>

      {/* Message d'erreur global */}
      {state.status === 'error' &&
        !state.fieldErrors?.confirmPassword &&
        state.errorMessage && (
          <p
            className="text-sm text-center py-2 px-3 rounded-lg"
            style={{
              color: 'var(--red)',
              backgroundColor: 'rgba(248,113,113,0.05)',
              border: '1px solid rgba(248,113,113,0.15)',
            }}
          >
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
            <span>Création en cours...</span>
          </>
        ) : (
          <span>Créer un compte</span>
        )}
      </button>
    </form>
  )
}
