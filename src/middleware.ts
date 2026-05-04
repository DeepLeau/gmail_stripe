import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionId = request.nextUrl.searchParams.get('session_id')

  const PROTECTED_PREFIXES = ['/chat']
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))

  // Also handle /signup with session_id (connected user arriving after Stripe payment)
  const isSignupWithSession = pathname === '/signup' && !!sessionId

  if (!isProtected && !isSignupWithSession) {
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

  // Handle /signup?session_id=... with already-authenticated user
  if (isSignupWithSession && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/chat'
    url.searchParams.delete('session_id')

    // Attempt to link the Stripe session — don't block on failure (webhook handles it)
    try {
      const linkResponse = await fetch(
        `${request.nextUrl.origin}/api/stripe/link?session_id=${sessionId}&user_id=${user.id}`,
        { method: 'GET', headers: { 'Content-Type': 'application/json' } }
      )
      if (linkResponse.ok) {
        // Link succeeded — cookie already refreshed via getUser() call
        return NextResponse.redirect(url, 302)
      }
    } catch {
      // Link failed (network or webhook not yet processed) — redirect anyway
    }

    return NextResponse.redirect(url, 302)
  }

  // Normal protected route check
  if (!user && isProtected) {
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
