/**
 * Supabase Server Client
 * Used in Server Components, Server Actions, and Route Handlers.
 *
 * Pattern lazy : retourne null si les env vars ne sont pas encore disponibles,
 * permettant au composant de render sans crasher au prerender/build.
 * Le throw a été retiré car Next.js exécute certains Server Components
 * au build time (prerender) où les env vars ne sont pas injectées.
 */
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
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
