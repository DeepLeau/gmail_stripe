'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Loader2, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { AuthCard } from '@/components/auth/AuthCard'

type PlanInfo = {
  name: string
  price: string
  messagesLimit: number
}

type PageState = 'loading' | 'ready' | 'invalid_session' | 'error'

const PLAN_LABELS: Record<string, { name: string; price: string; messagesLimit: number }> = {
  start: { name: 'Start', price: '9 €', messagesLimit: 50 },
  scale: { name: 'Scale', price: '19 €', messagesLimit: 100 },
  team: { name: 'Team', price: '49 €', messagesLimit: 300 },
}

function SignupWithPlanContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('session_id')

  const [pageState, setPageState] = useState<PageState>('loading')
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const MIN_PASSWORD_LENGTH = 6

  // Verify Stripe session on mount
  useEffect(() => {
    async function verifySession() {
      if (!sessionId) {
        setPageState('invalid_session')
        setErrorMessage(
          'Lien de session invalide ou expiré. Veuillez sélectionner à nouveau un plan.'
        )
        return
      }

      try {
        const response = await fetch(
          `/api/stripe/verify-session?session_id=${encodeURIComponent(sessionId)}`
        )

        if (!response.ok) {
          setPageState('invalid_session')
          setErrorMessage(
            'Cette session a expiré ou est invalide. Veuillez sélectionner à nouveau un plan.'
          )
          return
        }

        const data = await response.json()
        const planKey = data.plan as string
        const plan = PLAN_LABELS[planKey] ?? PLAN_LABELS.start

        setPlanInfo({
          name: plan.name,
          price: plan.price,
          messagesLimit: plan.messagesLimit,
        })
        setPageState('ready')
      } catch {
        setPageState('error')
        setErrorMessage('Une erreur est survenue lors de la vérification. Réessayez.')
      }
    }

    verifySession()
  }, [sessionId])

  function validateForm(): boolean {
    if (!email.trim()) {
      setFormError("L'adresse email est requise")
      return false
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setFormError('Adresse email invalide')
      return false
    }
    if (!password) {
      setFormError('Le mot de passe est requis')
      return false
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setFormError(`Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères`)
      return false
    }
    if (password !== confirmPassword) {
      setFormError('Les mots de passe ne correspondent pas')
      return false
    }
    setFormError(null)
    return true
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    const supabase = createClient()

    if (!supabase) {
      setFormError('Service temporairement indisponible')
      setIsSubmitting(false)
      return
    }

    // Create the account
    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    })

    if (signUpError) {
      const message =
        signUpError.message === 'User already registered'
          ? 'Un compte existe déjà avec cet email'
          : "Une erreur est survenue lors de la création du compte"
      setFormError(message)
      setIsSubmitting(false)
      return
    }

    // Redirect to chat
    router.push('/chat')
  }

  // Loading state
  if (pageState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent)' }} />
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>
            Vérification de votre sélection...
          </p>
        </div>
      </div>
    )
  }

  // Invalid session or error state
  if (pageState === 'invalid_session' || pageState === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="max-w-sm w-full mx-4">
          <div
            className="flex flex-col items-center gap-4 p-8 rounded-xl text-center"
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
            }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--red)]/10' }}
            >
              <AlertCircle size={24} style={{ color: 'var(--red)' }} strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>
                Session expirée
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-2)', lineHeight: 1.6 }}>
                {errorMessage ?? 'Une erreur inattendue est survenue.'}
              </p>
            </div>
            <a
              href="/#pricing"
              className="h-10 px-5 flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors duration-150 w-full"
              style={{
                backgroundColor: 'var(--accent)',
                color: '#fff',
              }}
            >
              <span>Choisir un plan</span>
              <ArrowRight size={15} strokeWidth={1.5} />
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Ready state — show plan summary + account form
  return (
    <AuthCard
      title="Finaliser ton inscription"
      altLinkLabel="Annuler et retourner à l'accueil"
      altLinkHref="/"
    >
      {/* Plan summary */}
      {planInfo && (
        <div
          className="mb-6 p-4 rounded-xl"
          style={{
            backgroundColor: 'var(--accent-light)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={16} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
              Plan sélectionné
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-base font-semibold" style={{ color: 'var(--text)' }}>
                {planInfo.name}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-2)' }}>
                {planInfo.messagesLimit} questions / mois
              </p>
            </div>
            <p className="text-lg font-bold" style={{ color: 'var(--accent)' }}>
              {planInfo.price}
              <span className="text-xs font-normal" style={{ color: 'var(--text-3)' }}>/mois</span>
            </p>
          </div>
        </div>
      )}

      {/* Account form */}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>
            Adresse email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            placeholder="vous@exemple.com"
            className="h-10 px-3 rounded-lg text-sm transition-colors duration-150
                       bg-[var(--bg)] border text-[var(--text)] placeholder:text-[var(--text-3)]
                       focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20
                       disabled:opacity-50 disabled:cursor-not-allowed
                       border-[var(--border-md)] focus:border-[var(--accent)]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            placeholder="Minimum 6 caractères"
            className="h-10 px-3 rounded-lg text-sm transition-colors duration-150
                       bg-[var(--bg)] border text-[var(--text)] placeholder:text-[var(--text-3)]
                       focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20
                       disabled:opacity-50 disabled:cursor-not-allowed
                       border-[var(--border-md)] focus:border-[var(--accent)]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirmPassword" className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>
            Confirmer le mot de passe
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isSubmitting}
            placeholder="••••••••"
            className="h-10 px-3 rounded-lg text-sm transition-colors duration-150
                       bg-[var(--bg)] border text-[var(--text)] placeholder:text-[var(--text-3)]
                       focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20
                       disabled:opacity-50 disabled:cursor-not-allowed
                       border-[var(--border-md)] focus:border-[var(--accent)]"
          />
        </div>

        {formError && (
          <p className="text-sm text-[var(--red)] text-center py-2 px-3 rounded-lg bg-[var(--red)]/5 border border-[var(--red)]/15">
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-10 px-4 flex items-center justify-center gap-2 rounded-lg
                     bg-[var(--accent)] hover:bg-[var(--accent-hi)] text-white
                     text-sm font-medium transition-colors duration-150
                     disabled:opacity-60 disabled:cursor-not-allowed mt-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={15} className="animate-spin shrink-0" />
              <span>Création en cours...</span>
            </>
          ) : (
            <span>Créer mon compte</span>
          )}
        </button>
      </form>
    </AuthCard>
  )
}

export default function SignupWithPlanPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
          <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent)' }} />
        </div>
      }
    >
      <SignupWithPlanContent />
    </Suspense>
  )
}
