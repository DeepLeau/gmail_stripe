/**
 * Supabase service_role client for webhook handlers.
 * Uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS — reserved for
 * server-side only code (webhooks, admin scripts).
 *
 * We keep this separate from lib/supabase/server.ts because that helper
 * uses the anon key (authenticated user context). The webhook needs
 * service_role to bypass RLS for the apply_subscription_change RPC.
 */
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing Supabase environment variables for service role client. ' +
        'Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    )
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey)
}
