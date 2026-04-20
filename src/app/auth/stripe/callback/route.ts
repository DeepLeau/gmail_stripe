import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/config'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.redirect(new URL('/signup?error=no_session', request.url))
  }

  // Stocker le session_id en cookie pour la page de succès
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const response = NextResponse.redirect(`${appUrl}/signup/success`)

  response.cookies.set('stripe_session_id', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 30, // 30 minutes
    path: '/',
  })

  return response
}
