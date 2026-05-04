/**
 * src/lib/stripe/hooks/useSignupWithStripeLinking.ts
 *
 * Hook React figé qui orchestre le flow guest signup → linking Stripe.
 * Template: guest-subscription-quota
 *
 * NE PAS MODIFIER CE FICHIER MANUELLEMENT.
 * Régénéré par Kurtel à partir de templates/stripe/guest-subscription-quota/files/lib/stripe/hooks/useSignupWithStripeLinking.ts.template
 *
 * ─── DEUX MODES D'UTILISATION ─────────────────────────────────────────────
 *
 * MODE 1 — `signup()` (form simple : email + password, ± metadata)
 *
 *   const { status, errorMessage, signup } = useSignupWithStripeLinking({
 *     pendingSessionId,
 *     redirectTo: '/chat',
 *   })
 *
 *   async function handleSubmit(e) {
 *     e.preventDefault()
 *     if (!validate()) return
 *     const result = await signup(email, password, {
 *       userMetadata: { full_name: name, company },  // optionnel
 *     })
 *     if (result.ok) {
 *       // ex: insert dans `profiles`, déclencher analytics, etc.
 *       // (le hook a déjà fait router.push donc ce code tourne avant nav)
 *     }
 *   }
 *
 * MODE 2 — `withStripeLinking()` (form custom : auth flow non standard,
 *           wizard multi-étapes, Server Action de signup, etc.)
 *
 *   const { status, errorMessage, withStripeLinking } = useSignupWithStripeLinking({
 *     pendingSessionId,
 *   })
 *
 *   async function handleSubmit(e) {
 *     e.preventDefault()
 *     const result = await withStripeLinking(async () => {
 *       // Ton flow signup à toi : peut être supabase.auth.signUp avec options
 *       // custom, une Server Action, un OTP magic link callback, etc.
 *       // Doit retourner { user: { id }, error } — la forme standard supabase.
 *       const { data, error } = await supabase.auth.signUp({
 *         email, password,
 *         options: { data: { ...whateverYouWant } },
 *       })
 *       return { user: data.user, error }
 *     })
 *     if (result.ok) { ... }
 *   }
 *
 * ─── ORCHESTRATION (identique dans les deux modes) ────────────────────────
 *
 *   1. Exécute le signup (auth.signUp en mode 1, signupFn en mode 2)
 *   2. Si pendingSessionId présent : linkStripeSessionToUser(pendingSessionId)
 *   3. Si pending_not_found avec retry=true : retry une fois après 2s
 *   4. router.push(redirectTo)
 *
 * Status retourné :
 *   - 'idle'          → état initial
 *   - 'signing_up'    → en cours de signup
 *   - 'linking'       → en cours de linkStripeSessionToUser
 *   - 'error'         → échec, errorMessage contient le message à afficher
 *
 * Pourquoi ce hook plutôt qu'une logique inline dans SignupForm :
 * - Le linking exige l'enchaînement précis signUp → linkStripeSessionToUser → retry,
 *   et à chaque génération sans ce hook le LLM réinvente la plomberie en l'oubliant
 *   (cf. PR #36-37, route /api/stripe/pending-link puis /api/auth/signup hallucinées).
 * - Centraliser ici garantit que le mapping query_param→hook (session_id, pas
 *   session_token ni autre) reste cohérent dans tous les projets.
 */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { linkStripeSessionToUser } from '@/app/actions/subscription'

export type SignupStatus = 'idle' | 'signing_up' | 'linking' | 'error'

export interface UseSignupWithStripeLinkingOptions {
  /**
   * Token de session Stripe à lier après signup.
   * DOIT venir de `searchParams.session_id` sur la page /signup
   * (param canonique défini dans success_url du checkout : /signup?session_id={CHECKOUT_SESSION_ID}).
   */
  pendingSessionId?: string

  /** Destination après signup réussi. Défaut: '/chat'. */
  redirectTo?: string

  /**
   * Metadata utilisateur stockés dans auth.users.raw_user_meta_data
   * lors du signUp. UTILISÉ UNIQUEMENT EN MODE 1 (signup()).
   * Pour des champs structurés requêtables, préfère une table `profiles`
   * séparée alimentée APRÈS signup réussi (cf. exemple en haut du fichier).
   */
  userMetadata?: Record<string, unknown>
}

/**
 * Forme attendue du retour d'un signup function en mode 2.
 * Compatible avec ce que retourne `supabase.auth.signUp` (data.user / error).
 */
export interface SignupFnResult {
  user: { id: string } | null
  error: { message: string } | null
}

export interface SignupExtras {
  /**
   * Metadata utilisateur stockés dans auth.users.raw_user_meta_data.
   * Override `opts.userMetadata` si fourni.
   */
  userMetadata?: Record<string, unknown>
}

export interface SignupResult {
  ok: boolean
  /** Présent si ok=false. Message déjà human-readable, prêt pour UI. */
  error?: string
}

export interface UseSignupWithStripeLinkingResult {
  status: SignupStatus
  errorMessage: string | null

  /**
   * MODE 1 — signup classique email + password (+ metadata optionnel).
   * Le hook fait lui-même supabase.auth.signUp.
   */
  signup: (email: string, password: string, extras?: SignupExtras) => Promise<SignupResult>

  /**
   * MODE 2 — wrapper qui prend une fonction de signup arbitraire.
   * Utilise-le si tu as besoin de contrôler les options du signUp
   * (Server Action, options.data complexes, OAuth, OTP, etc.).
   * La fonction passée doit retourner { user, error } à la forme supabase.
   */
  withStripeLinking: (signupFn: () => Promise<SignupFnResult>) => Promise<SignupResult>
}

const LINK_RETRY_DELAY_MS = 2000

function humanizeSignupError(message: string): string {
  if (message === 'User already registered') {
    return 'Un compte existe déjà avec cet email'
  }
  return 'Une erreur est survenue lors de la création du compte'
}

export function useSignupWithStripeLinking(
  opts: UseSignupWithStripeLinkingOptions = {}
): UseSignupWithStripeLinkingResult {
  const router = useRouter()
  const [status, setStatus] = useState<SignupStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // ── Étape commune : linking + redirection après un signup réussi ────────
  // Appelée par signup() ET par withStripeLinking() une fois qu'on a un user.
  async function finalizeAfterSignup(): Promise<SignupResult> {
    if (opts.pendingSessionId) {
      setStatus('linking')

      let result = await linkStripeSessionToUser(opts.pendingSessionId)

      // Retry si le webhook n'est pas encore arrivé
      if (!result.success && result.error === 'pending_not_found' && result.retry) {
        await new Promise(r => setTimeout(r, LINK_RETRY_DELAY_MS))
        result = await linkStripeSessionToUser(opts.pendingSessionId)
      }

      // Si échec persistent : log mais on redirige quand même.
      // L'user pourra retry depuis une page settings/billing si le projet en a.
      if (!result.success) {
        console.warn('[useSignupWithStripeLinking] Linking failed after retry:', result.error)
      }
    }

    router.push(opts.redirectTo ?? '/chat')
    return { ok: true }
  }

  // ── MODE 1 — signup classique ───────────────────────────────────────────
  async function signup(
    email: string,
    password: string,
    extras?: SignupExtras
  ): Promise<SignupResult> {
    setStatus('signing_up')
    setErrorMessage(null)

    const supabase = createClient()
    if (!supabase) {
      const msg = 'Service temporairement indisponible'
      setStatus('error')
      setErrorMessage(msg)
      return { ok: false, error: msg }
    }

    // Merge des metadata : extras (per-call) override opts (per-hook)
    const userMetadata = extras?.userMetadata ?? opts.userMetadata
    const signUpPayload: Parameters<typeof supabase.auth.signUp>[0] = {
      email: email.trim(),
      password,
    }
    if (userMetadata && Object.keys(userMetadata).length > 0) {
      signUpPayload.options = { data: userMetadata }
    }

    const { error: signUpError } = await supabase.auth.signUp(signUpPayload)

    if (signUpError) {
      const msg = humanizeSignupError(signUpError.message)
      setStatus('error')
      setErrorMessage(msg)
      return { ok: false, error: msg }
    }

    return finalizeAfterSignup()
  }

  // ── MODE 2 — wrapper décorateur ─────────────────────────────────────────
  async function withStripeLinking(
    signupFn: () => Promise<SignupFnResult>
  ): Promise<SignupResult> {
    setStatus('signing_up')
    setErrorMessage(null)

    let result: SignupFnResult
    try {
      result = await signupFn()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Une erreur est survenue lors de la création du compte'
      setStatus('error')
      setErrorMessage(msg)
      return { ok: false, error: msg }
    }

    if (result.error) {
      const msg = humanizeSignupError(result.error.message)
      setStatus('error')
      setErrorMessage(msg)
      return { ok: false, error: msg }
    }

    if (!result.user) {
      const msg = 'Création du compte échouée (aucun utilisateur retourné)'
      setStatus('error')
      setErrorMessage(msg)
      return { ok: false, error: msg }
    }

    return finalizeAfterSignup()
  }

  return { status, errorMessage, signup, withStripeLinking }
}
