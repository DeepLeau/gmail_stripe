/**
 * Supabase Service Role Client
 * Used in Route Handlers for privileged operations (webhooks, cron).
 * BYPASSES Row Level Security — never expose this client to the browser.
 *
 * Usage: import from '@/lib/supabase/service-role'
 */
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing Supabase service role credentials. ' +
        'Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
    )
  }

  return createAdminClient(supabaseUrl, serviceRoleKey)
}

export function createServiceRoleSupabase() {
  return createServiceRoleClient()
}
