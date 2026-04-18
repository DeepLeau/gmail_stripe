/**
 * Supabase Browser Client
 * Used in Client Components ('use client') for auth operations and data fetching.
 */
import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates the browser client lazily on first call.
 * Returns null during build / SSR when env vars are not yet available,
 * allowing the component to render without crashing.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
