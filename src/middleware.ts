import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * SECURITY_GAP EVALUATION — /chat access control
 *
 * Decision: subscription_status is NOT enforced at the middleware layer.
 *
 * Rationale:
 *   - Users without an active row in user_subscriptions are NOT blocked from /chat.
 *     Instead, their quota is 0 (no Free plan is implied). The quota check lives
 *     exclusively in GET /api/messages/usage, which returns 429 when remaining === 0.
 *   - Enforcing subscription_status in middleware would require an extra DB read on
 *     every protected request, adding latency and coupling the auth layer to the
 *     billing schema. The current separation of concerns (auth in middleware, quota in
 *     route handler) is simpler and sufficient.
 *   - Blocking users at the middleware level based on subscription_status would also
 *     complicate the guest checkout flow (user reaches /chat before Stripe webhook has
 *     populated user_subscriptions).
 *
 * Future hardening: if the threat model requires stronger guarantees (e.g., preventing
 * unauthenticated access to chat infrastructure), consider adding subscription_status
 * validation here using a cached / short-lived check, or moving the quota gate to a
 * middleware-level token validation.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const PROTECTED_PREFIXES = ['/chat']
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))

  if (!isProtected) {
    return NextResponse.next({ request })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Middleware] Supabase env vars missing — redirecting to /login')
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url, 302)
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set({ name, value, ...options })
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url, 302)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
