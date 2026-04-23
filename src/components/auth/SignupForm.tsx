'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

type SignupFormState = {
  status: 'idle' | 'loading' | 'error' | 'password_mismatch' | 'success'
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
  const [state, setState] = useState<SignupFormState>({ status: 'idle' })
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const isLoading = state.status === 'loading'

  function validate(): boolean {
    const fieldErrors: SignupFormState['fieldErrors'] = {}

    if (!email.trim()) {
      fieldErrors.email = 'L\'adresse email est requise'
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

    setState({ status: 'success' })
  }

  if (state.status === 'success') {
    return (
      <div className="flex flex-col gap-6 py-4">
        {/* Success message */}
        <div className="flex flex-col items-center text-center gap-3 p-6 rounded-xl bg-green-50 border border-green-100">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <Zap size={20} className="text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 mb-1">Compte créé avec succès !</p>
            <p className="text-sm text-gray-600">
              Tu peux maintenant accéder au chat et poser tes premières questions.
            </p>
          </div>
        </div>

        {/* CTA to choose plan */}
        <div className="flex flex-col gap-3">
          <p className="text-sm text-center text-gray-600">
            Débloque plus de questions en souscrivant à un plan :
          </p>
          <Link
            href="/#pricing"
            className="h-10 px-4 flex items-center justify-center gap-2 rounded-lg
                       bg-[var(--accent)] hover:bg-[var(--accent-hi)] text-white
                       text-sm font-medium transition-colors duration-150"
          >
            <Zap size={14} />
            <span>Voir les plans disponibles</span>
          </Link>
          <button
            onClick={() => router.push('/chat')}
            className="h-10 px-4 flex items-center justify-center gap-2 rounded-lg
                       bg-[var(--bg)] border border-[var(--border-md)] text-[var(--text-2)]
                       text-sm font-medium transition-colors duration-150
                       hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            Aller au chat directement
          </button>
        </div>
      </div>
    )
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
            <span>Création en cours...</span>
          </>
        ) : (
          <span>Créer un compte</span>
        )}
      </button>
    </form>
  )
}
