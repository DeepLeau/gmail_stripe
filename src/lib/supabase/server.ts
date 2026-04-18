/**
 * Supabase Server Client
 * Used in Server Components, Server Actions, and Route Handlers.
 * Requires a cookies adapter from Next.js Request or Response.
 */
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Create a Supabase server client from a Server Component or Route Handler
 * using the Next.js 15+ cookies() API.
 *
 * Usage in Server Components:
 *   import { createClient } from '@/lib/supabase/server'
 *   const supabase = await createClient()
 *
 * Usage in Route Handlers / Server Actions (Next.js 14 compatible):
 *   import { createClient } from '@/lib/supabase/server'
 *   const supabase = createClient(request)
 */
export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
      'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file. ' +
      'See https://supabase.com/dashboard/project/_/settings/api'
    )
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
