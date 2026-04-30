/**
 * src/app/actions/subscription.ts
 *
 * Server Actions pour le flow GUEST.
 * Template: guest-subscription-quota
 *
 * Exporte :
 * - linkStripeSessionToUser(sessionId): à appeler APRÈS supabase.auth.signUp() pour lier
 *   le paiement guest au user fraîchement créé.
 * - decrementUnits(): gating runtime pour les actions consommatrices de quota.
 * - getCurrentSubscription(): lecture pour UI.
 *
 * NE PAS MODIFIER CE FICHIER MANUELLEMENT.
 */
'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export interface LinkResult {
  success: boolean
  error?: 'unauthorized' | 'pending_not_found' | 'session_linked_to_another_user' | 'rpc_error'
  retry?: boolean
  already_linked?: boolean
  plan?: string
  units_limit?: number
  subscription_status?: string
}

export interface DecrementResult {
  success: boolean
  error?: 'unauthorized' | 'no_subscription_row' | 'limit_reached' | 'rpc_error'
  remaining?: number
  plan?: string
  subscription_status?: string
}

export interface SubscriptionState {
  plan: string | null
  subscription_status: string
  units_used: number
  units_limit: number
  current_period_end: string | null
}

function getServerSupabase() {
  return cookies().then((cookieStore) =>
    createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll() {},
        },
      }
    )
  )
}

/**
 * Lie une session Stripe (paiement guest) au user fraîchement signé.
 *
 * Doit être appelée APRÈS un signUp() réussi, sur la page /signup quand session_id
 * est présent dans les query params.
 *
 * Cas de retour :
 * - success=true → lien fait, le quota du user est maintenant celui du plan acheté
 * - success=true, already_linked=true → idempotent, déjà lié
 * - success=false, retry=true, error='pending_not_found' → le webhook n'est pas
 *   encore arrivé. Le client doit retry après quelques secondes.
 * - success=false, error='session_linked_to_another_user' → anomalie : un autre
 *   user a déjà signé avec ce session_id.
 */
export async function linkStripeSessionToUser(sessionId: string): Promise<LinkResult> {
  const supabase = await getServerSupabase()

  const { data, error } = await supabase.rpc('link_stripe_session_to_user', {
    p_session_id: sessionId,
  })

  if (error) {
    console.error('[linkStripeSessionToUser] RPC error:', error)
    return { success: false, error: 'rpc_error' }
  }

  return data as LinkResult
}

/**
 * Décrémente le compteur de units du user courant.
 */
export async function decrementUnits(): Promise<DecrementResult> {
  const supabase = await getServerSupabase()
  const { data, error } = await supabase.rpc('decrement_units')
  if (error) {
    console.error('[decrementUnits] RPC error:', error)
    return { success: false, error: 'rpc_error' }
  }
  return data as DecrementResult
}

/**
 * Lit l'état d'abonnement du user courant.
 */
export async function getCurrentSubscription(): Promise<SubscriptionState | null> {
  const supabase = await getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('plan, subscription_status, units_used, units_limit, current_period_end')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    console.error('[getCurrentSubscription] Read error:', error)
    return null
  }

  if (!data) {
    return {
      plan: null,
      subscription_status: 'free',
      units_used: 0,
      units_limit: 0,
      current_period_end: null,
    }
  }

  return data as SubscriptionState
}
