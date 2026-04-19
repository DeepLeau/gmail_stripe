'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { AuthCard } from '@/components/auth/AuthCard'
import { createClient } from '@/lib/supabase/client'

interface SignupFormProps {
  selectedPlanId?: string
  stripeSessionId?: string
  redirectTo?: string
}

type FormState = 'idle' | 'loading' | 'success' | 'plan_confirmed' | 'error'

export function SignupForm({ selectedPlanId, stripeSessionId, redirectTo }: SignupFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formState, setFormState] = useState<FormState>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setFormState('loading')

    try {
      const supabase = createClient()
      if (!supabase) {
        setFormState('error')
        setErrorMessage('Service momentanément indisponible.')
        return
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            plan_id: selectedPlanId ?? null,
            stripe_session_id: stripeSessionId ?? null,
          },
        },
      })

      if (error) {
        setFormState('error')
        setErrorMessage(error.message)
        return
      }

      // Si un plan Stripe a été sélectionné, afficher le message de confirmation
      if (selectedPlanId && stripeSessionId) {
        setFormState('plan_confirmed')
        setSuccessMessage('🎉 Plan activé ! Redirection vers votre espace chat...')
        // Petit délai pour laisser le temps au webhook de traiter la session
        setTimeout(() => {
          router.push('/chat')
        }, 2000)
      } else {
        setFormState('success')
        setSuccessMessage('Compte créé ! Vérifiez votre email pour confirmer votre inscription.')
      }
    } catch {
      setFormState('error')
      setErrorMessage('Une erreur inattendue est survenue. Veuillez réessayer.')
    }
  }

  const isLoading = formState === 'loading'
  const isSuccess = formState === 'success'
  const isPlanConfirmed = formState === 'plan_confirmed'

  return (
    <AuthCard
      title="Créer un compte"
      altLinkLabel="Déjà inscrit ?"
      altLinkHref="/login"
    >
      {/* Success plan confirmed */}
      {isPlanConfirmed && (
        <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
          <p className="text-sm text-green-400 text-center">{successMessage}</p>
          <div className="flex justify-center mt-2">
            <Loader2 size={16} className="animate-spin text-green-400" strokeWidth={2} />
          </div>
        </div>
      )}

      {/* Success generic */}
      {isSuccess && (
        <div className="mb-4 p-3 rounded-lg bg-[var(--green)]/10 border border-[var(--green)]/20">
          <p className="text-sm text-[var(--green)] text-center">{successMessage}</p>
        </div>
      )}

      {/* Plan badge (if coming from pricing) */}
      {selectedPlanId && !isPlanConfirmed && (
        <div className="mb-4 flex items-center justify-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
            Plan sélectionné : <strong className="capitalize">{selectedPlanId}</strong>
          </span>
        </div>
      )}

      {/* Error */}
      {formState === 'error' && errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-[var(--red)]/10 border border-[var(--red)]/20">
          <p className="text-sm text-[var(--red)] text-center" role="alert">
            {errorMessage}
          </p>
        </div>
      )}

      {/* Form */}
      {!isSuccess && !isPlanConfirmed && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-sm font-medium text-[var(--text-1)]"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              required
              disabled={isLoading}
              className="h-9 w-full rounded-lg border border-[var(--border-md)] bg-[var(--input-bg)] px-3 text-sm text-[var(--text-1)] placeholder:text-[var(--text-2)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-150"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-sm font-medium text-[var(--text-1)]"
            >
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
              disabled={isLoading}
              className="h-9 w-full rounded-lg border border-[var(--border-md)] bg-[var(--input-bg)] px-3 text-sm text-[var(--text-1)] placeholder:text-[var(--text-2)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-150"
            />
            <p className="text-xs text-[var(--text-2)]">
              Minimum 8 caractères
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="h-9 w-full rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium text-sm transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
          >
            {isLoading && <Loader2 size={15} className="animate-spin" strokeWidth={2} />}
            {isLoading ? 'Création du compte...' : 'Créer mon compte'}
          </button>
        </form>
      )}
    </AuthCard>
  )
}
