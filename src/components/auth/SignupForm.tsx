'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { linkStripeSessionToUser } from '@/app/actions/subscription'

type SignupFormState = {
  status: 'idle' | 'loading' | 'linking' | 'error' | 'password_mismatch'
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
  const pendingSessionId = searchParams.get('session_id') ?? undefined

  const [state, setState] = useState<SignupFormState>({ status: 'idle' })
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [linkingSuccess, setLinkingSuccess] = useState(false)

  const linkingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isLoading = state.status === 'loading' || state.status === 'linking'

  // Nettoyage du timeout si le composant unmount
  useEffect(() => {
    return () => {
      if (linkingTimeoutRef.current) clearTimeout(linkingTimeoutRef.current)
    }
  }, [])

  // Si linking a réussi → redirect
  useEffect(() => {
    if (linkingSuccess) {
      router.push('/chat')
    }
  }, [linkingSuccess, router])

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

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    })

    if (error) {
      const message = error.message === 'User already registered'
        ? 'Un compte existe déjà avec cet email'
        : 'Une erreur est survenue lors de la création du compte'
      setState({ status: 'error', errorMessage: message })
      return
    }

    // Pas de session Stripe en attente → redirect normal
    if (!pendingSessionId) {
      router.push('/chat')
      return
    }

    // Session Stripe en attente → orchestrer le linking
    setState({ status: 'linking', errorMessage: "Activation de votre abonnement…" })

    // Démarrer le timeout de 30s pour le linking
    linkingTimeoutRef.current = setTimeout(() => {
      // Timeout atteint : on redirige quand même avec un message d'avertissement
      setLinkingSuccess(true)
    }, 30000)

    try {
      const result = await linkStripeSessionToUser(pendingSessionId)
      if (linkingTimeoutRef.current) {
        clearTimeout(linkingTimeoutRef.current)
        linkingTimeoutRef.current = null
      }

      if (result.success) {
        setLinkingSuccess(true)
      } else {
        // Linking échoué → message d'erreur, l'user reste sur la page
        const linkErrorMsg = result.error ?? "Impossible d'activer votre abonnement. Il sera actif sous quelques instants."
        setState({ status: 'error', errorMessage: linkErrorMsg })
        // Redirection aussi, mais avec le message d'erreur
        setTimeout(() => {
          router.push('/chat')
        }, 2500)
      }
    } catch {
      if (linkingTimeoutRef.current) {
        clearTimeout(linkingTimeoutRef.current)
        linkingTimeoutRef.current = null
      }
      setState({ status: 'error', errorMessage: "Une erreur est survenue. Votre abonnement sera actif sous quelques instants." })
      setTimeout(() => {
        router.push('/chat')
      }, 2500)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {/* État linking : bannière d'avertissement */}
      {state.status === 'linking' && (
        <div className="flex items-center gap-3 py-3 px-4 rounded-lg text-sm"
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: '#92400e',
          }}>
          <Loader2 size={15} className="animate-spin shrink-0" />
          <span>{state.errorMessage}</span>
        </div>
      )}

      {/* État post-linking : toast warning */}
      {state.status === 'error' && state.errorMessage?.includes('quelques instants') && (
        <div className="flex items-center gap-3 py-3 px-4 rounded-lg text-sm"
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: '#92400e',
          }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span>{state.errorMessage}</span>
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

      {/* Message d'erreur global (hors linking) */}
      {state.status === 'error' && !state.errorMessage?.includes('quelques instants') && !state.fieldErrors?.confirmPassword && state.errorMessage && (
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
            <span>{state.status === 'linking' ? "Activation en cours…" : "Création en cours…"}</span>
          </>
        ) : (
          <span>Créer un compte</span>
        )}
      </button>
    </form>
  )
}
