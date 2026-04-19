/**
 * Supabase Browser Client
 * Used in Client Components ('use client') for auth operations.
 *
 * Pattern lazy : s'exécute uniquement au runtime, jamais au prerender.
 * Retourne null si les env vars ne sont pas encore disponibles,
 * permettant au composant de render sans crasher.
 */
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
