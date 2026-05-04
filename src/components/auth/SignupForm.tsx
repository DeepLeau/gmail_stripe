'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { linkStripeSessionToUser } from '@/app/actions/stripe'

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
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1000
const LINK_SUCCESS_FADE_MS = 3000
const REDIRECT_DELAY_MS = 1500

export function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  const [state, setState] = useState<SignupFormState>({ status: 'idle' })
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Notification state for successful link
  const [showLinkNotification, setShowLinkNotification] = useState(false)
  const notificationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Clean up notification timer on unmount
  useEffect(() => {
    return () => {
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current)
      }
    }
  }, [])

  const isLoading = state.status === 'loading' || state.status === 'linking'

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

  async function attemptLinkStripeSession(sid: string): Promise<boolean> {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const result = await linkStripeSessionToUser(sid)
      if (result.linked) return true

      // If it's a server error (not "not found"), don't retry
      if (result.error && !result.error.includes('not found') && !result.error.includes('not available')) {
        return false
      }

      if (attempt < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS))
      }
    }
    return false
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
        : "Une erreur est survenue lors de la création du compte"
      setState({ status: 'error', errorMessage: message })
      return
    }

    // Sign-up succeeded — now handle Stripe session linking if session_id present
    if (sessionId) {
      setState({ status: 'linking' })
      const linked = await attemptLinkStripeSession(sessionId)

      if (linked) {
        setShowLinkNotification(true)
        notificationTimerRef.current = setTimeout(() => {
          setShowLinkNotification(false)
          router.push('/chat')
        }, REDIRECT_DELAY_MS)
      } else {
        // Link failed after retries — redirect anyway, webhook will handle it
        router.push('/chat')
      }
    } else {
      router.push('/chat')
    }
  }

  return (
    <>
      {/* Subscription activated notification */}
      {showLinkNotification && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg"
          style={{
            backgroundColor: 'var(--green)',
            color: '#fff',
            animation: 'fadeIn 0.3s ease',
          }}
        >
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          Abonnement activé
        </div>
      )}

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
                {state.status === 'linking' ? 'Activation en cours...' : 'Création en cours...'}
              </span>
            </>
          ) : (
            <span>Créer un compte</span>
          )}
        </button>
      </form>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, -8px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </>
  )
}
