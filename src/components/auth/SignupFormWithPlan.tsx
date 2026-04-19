'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Spinner } from '@/components/ui/Spinner'

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

interface SignupFormWithPlanProps {
  sessionId?: string
  plan: string
  prefilledEmail?: string
}

export function SignupFormWithPlan({
  sessionId,
  plan,
  prefilledEmail,
}: SignupFormWithPlanProps) {
  const router = useRouter()
  const [state, setState] = useState<SignupFormState>({ status: 'idle' })
  const [email, setEmail] = useState(prefilledEmail ?? '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const isLoading = state.status === 'loading'

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
      fieldErrors.password = `Minimum ${MIN_PASSWORD_LENGTH} caractères`
    }

    if (password && confirmPassword && password !== confirmPassword) {
      fieldErrors.confirmPassword = 'Les mots de passe ne correspondent pas'
      setState({ status: 'password_mismatch', fieldErrors })
      return false
    }

    if (!confirmPassword) {
      fieldErrors.confirmPassword = 'Confirmation requise'
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

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    })

    if (error) {
      const message =
        error.message === 'User already registered'
          ? 'Un compte existe déjà avec cet email'
          : 'Une erreur est survenue lors de la création du compte'
      setState({ status: 'error', errorMessage: message })
      return
    }

    // If coming from Stripe checkout, link the subscription to the new user
    if (sessionId) {
      try {
        await fetch('/api/stripe/link-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            userEmail: email.trim(),
          }),
        })
      } catch {
        // Non-blocking — user is already created, subscription linking retries via webhook
      }
    }

    router.push('/chat')
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="email"
          className="text-sm font-medium"
          style={{
            fontFamily: 'var(--font-mono)',
            color: 'var(--neutral-text-muted)',
          }}
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
          className="h-11 px-3 border-2 text-sm transition-colors"
          style={{
            backgroundColor: 'var(--neutral-bg-alt)',
            borderColor: 'var(--border)',
            color: 'var(--neutral-text)',
            fontFamily: 'var(--font-mono)',
          }}
        />
        {state.status === 'error' && state.fieldErrors?.email && (
          <p
            className="text-xs flex items-center gap-1"
            style={{
              fontFamily: 'var(--font-mono)',
              color: 'var(--accent-primary)',
            }}
          >
            <AlertCircle size={12} />
            {state.fieldErrors.email}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="password"
          className="text-sm font-medium"
          style={{
            fontFamily: 'var(--font-mono)',
            color: 'var(--neutral-text-muted)',
          }}
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
          className="h-11 px-3 border-2 text-sm transition-colors"
          style={{
            backgroundColor: 'var(--neutral-bg-alt)',
            borderColor: 'var(--border)',
            color: 'var(--neutral-text)',
            fontFamily: 'var(--font-mono)',
          }}
        />
        {state.status === 'error' && state.fieldErrors?.password && (
          <p
            className="text-xs flex items-center gap-1"
            style={{
              fontFamily: 'var(--font-mono)',
              color: 'var(--accent-primary)',
            }}
          >
            <AlertCircle size={12} />
            {state.fieldErrors.password}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="confirmPassword"
          className="text-sm font-medium"
          style={{
            fontFamily: 'var(--font-mono)',
            color: 'var(--neutral-text-muted)',
          }}
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
          className="h-11 px-3 border-2 text-sm transition-colors"
          style={{
            backgroundColor: 'var(--neutral-bg-alt)',
            borderColor: 'var(--border)',
            color: 'var(--neutral-text)',
            fontFamily: 'var(--font-mono)',
          }}
        />
        {(state.status === 'error' || state.status === 'password_mismatch') &&
          state.fieldErrors?.confirmPassword && (
            <p
              className="text-xs flex items-center gap-1"
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--accent-primary)',
              }}
            >
              <AlertCircle size={12} />
              {state.fieldErrors.confirmPassword}
            </p>
          )}
      </div>

      {/* Global error */}
      {state.status === 'error' &&
        !state.fieldErrors?.confirmPassword &&
        state.errorMessage && (
          <p
            className="text-sm text-center py-3 px-4 border-2"
            style={{
              fontFamily: 'var(--font-mono)',
              backgroundColor: 'rgba(194,75,70,0.08)',
              borderColor: 'var(--accent-primary)',
              color: 'var(--accent-primary)',
            }}
          >
            {state.errorMessage}
          </p>
        )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="h-12 px-4 flex items-center justify-center gap-2 text-sm font-semibold border-2 transition-all mt-2"
        style={{
          backgroundColor: isLoading
            ? 'var(--neutral-text-muted)'
            : 'var(--accent-green)',
          color: '#ffffff',
          borderColor: 'var(--border)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        {isLoading ? (
          <>
            <Spinner size={16} color="#ffffff" />
            <span>Création en cours...</span>
          </>
        ) : (
          <span>Créer mon compte</span>
        )}
      </button>

      <p
        className="text-xs text-center"
        style={{
          fontFamily: 'var(--font-mono)',
          color: 'var(--neutral-text-muted)',
        }}
      >
        En créant un compte, vous acceptez nos{' '}
        <a href="#" className="underline">
          CGU
        </a>{' '}
        et notre{' '}
        <a href="#" className="underline">
          politique de confidentialité
        </a>
        .
      </p>
    </form>
  )
}
