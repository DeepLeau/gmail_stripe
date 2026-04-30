/**
 * Supabase Server Client
 * Used in Server Components, Server Actions, and Route Handlers.
 *
 * Pattern lazy + defensive : retourne null si les env vars ne sont pas là,
 * au lieu de thrower. Permet au build de prerenderer sans crasher quand
 * les variables ne sont pas définies (build time). Le composant appelant
 * doit gérer le cas null.
 */
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // Retourne null plutôt que thrower — le consumer gère le cas.
    return null
  }

  const cookieStore = await cookies()

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component — cookies can only be set in a Server Action or Route Handler.
            // The error is expected when calling from a Server Component.
          }
        },
      },
    }
  )
}
