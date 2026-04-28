/**
 * src/lib/stripe/hooks/useSignupWithStripeLinking.ts
 *
 * Hook React figé qui orchestre le flow guest signup → linking Stripe.
 * Template: guest-subscription-quota
 *
 * NE PAS MODIFIER CE FICHIER MANUELLEMENT.
 * Régénéré par Kurtel à partir de templates/stripe/guest-subscription-quota/files/lib/stripe/hooks/useSignupWithStripeLinking.ts.template
 *
 * Utilisation côté SignupForm :
 *
 *   const { status, errorMessage, signup } = useSignupWithStripeLinking({
 *     pendingSessionId,           // depuis searchParams.session_id
 *     redirectTo: '/chat',        // optionnel, défaut '/chat'
 *   })
 *
 *   async function handleSubmit(e) {
 *     e.preventDefault()
 *     if (!validate()) return
 *     await signup(email, password)
 *   }
 *
 * Le hook fait, dans l'ordre :
 *   1. supabase.auth.signUp(email, password) côté client
 *   2. Si pendingSessionId présent : linkStripeSessionToUser(pendingSessionId)
 *   3. Si pending_not_found avec retry=true : retry une fois après 2s
 *   4. router.push(redirectTo)
 *
 * Status retourné :
 *   - 'idle'          → état initial
 *   - 'signing_up'    → en cours de auth.signUp
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
}

export interface UseSignupWithStripeLinkingResult {
  status: SignupStatus
  errorMessage: string | null
  signup: (email: string, password: string) => Promise<void>
}

const LINK_RETRY_DELAY_MS = 2000

export function useSignupWithStripeLinking(
  opts: UseSignupWithStripeLinkingOptions = {}
): UseSignupWithStripeLinkingResult {
  const router = useRouter()
  const [status, setStatus] = useState<SignupStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function signup(email: string, password: string) {
    setStatus('signing_up')
    setErrorMessage(null)

    const supabase = createClient()
    if (!supabase) {
      setStatus('error')
      setErrorMessage('Service temporairement indisponible')
      return
    }

    // 1. Signup classique côté client
    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    })

    if (signUpError) {
      setStatus('error')
      setErrorMessage(
        signUpError.message === 'User already registered'
          ? 'Un compte existe déjà avec cet email'
          : 'Une erreur est survenue lors de la création du compte'
      )
      return
    }

    // 2. Si on vient d'un checkout guest, lier la session Stripe
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
  }

  return { status, errorMessage, signup }
}
