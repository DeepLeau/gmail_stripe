/**
 * Supabase Admin Client (service_role)
 * Used exclusively in server-side Route Handlers that need to bypass RLS
 * to read from auth.users or write to protected tables.
 *
 * Pattern: lazy singleton — only instantiated on first call, not at build time.
 * This client does NOT use @supabase/ssr — it is a pure backend client with
 * no cookie/session management. It bypasses RLS entirely via service_role.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

function createAdminClient(): SupabaseClient {
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error(
      'SUPABASE_URL is not set. ' +
        'Add SUPABASE_URL to your environment variables.'
    )
  }

  if (!serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. ' +
        'Add SUPABASE_SERVICE_ROLE_KEY to your environment variables. ' +
        'This key bypasses RLS — never expose it client-side (do NOT prefix with NEXT_PUBLIC_).'
    )
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      // Admin client has no session to persist — suppress session-related warnings
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

// Lazy singleton — instantiated once, cached for the lifetime of the process
let _adminClient: SupabaseClient | undefined

export function getAdminClient(): SupabaseClient {
  if (!_adminClient) {
    _adminClient = createAdminClient()
  }
  return _adminClient
}
