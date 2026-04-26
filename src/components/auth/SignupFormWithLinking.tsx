'use client'

import { useState, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { linkStripeSessionToUser } from '@/app/actions/subscription'
import { Loader2 } from 'lucide-react'

export function SignupFormWithLinking() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      if (!supabase) {
        setError('Erreur de configuration — impossible de se connecter.')
        return
      }

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      // Si un session_id Stripe est présent (flow guest), lier le paiement au user
      if (sessionId) {
        const result = await linkStripeSessionToUser(sessionId)
        if (!result.success && result.retry) {
          // Webhook pas encore arrivé — retry une fois après 1.5s
          await new Promise((r) => setTimeout(r, 1500))
          await linkStripeSessionToUser(sessionId)
        }
      }

      router.push('/chat')
    } catch {
      setError('Une erreur inattendue est survenue. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="px-3 py-2.5 rounded-lg text-sm border border-[var(--red)]/20 bg-[var(--red)]/5 text-[var(--red)]">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="email"
          className="text-sm font-medium text-[var(--text)]"
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
          className="h-10 px-3 rounded-lg border border-[var(--border-md)] bg-white text-sm text-[var(--text)] placeholder:text-[var(--text-3)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="password"
          className="text-sm font-medium text-[var(--text)]"
        >
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="8 caractères minimum"
          required
          minLength={8}
          disabled={isLoading}
          className="h-10 px-3 rounded-lg border border-[var(--border-md)] bg-white text-sm text-[var(--text)] placeholder:text-[var(--text-3)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="h-10 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hi)] text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
      >
        {isLoading ? (
          <>
            <Loader2 size={15} className="animate-spin" strokeWidth={2} />
            <span>Création en cours…</span>
          </>
        ) : (
          'Créer mon compte'
        )}
      </button>
    </form>
  )
}
