export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { WelcomeEmail } from '@/components/email/WelcomeEmail'
import { render } from '@react-email/components'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface WelcomeEmailPayload {
  email: string
  firstName?: string
}

/**
 * POST /api/email/welcome
 *
 * Body: { email: string; firstName?: string }
 * → 200: { ok: true }
 * → 400: { error: "email required" }  (email invalide / manquant)
 * → 500: { error: "Failed to send welcome email" }
 */
export async function POST(request: Request) {
  let body: WelcomeEmailPayload

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'email required' }, { status: 400 })
  }

  const { email, firstName } = body

  if (!email || !EMAIL_REGEX.test(email.trim())) {
    return NextResponse.json({ error: 'email required' }, { status: 400 })
  }

  const resendApiKey = process.env.RESEND_API_KEY

  if (!resendApiKey) {
    console.warn('[WelcomeEmail] RESEND_API_KEY not configured — skipping send')
    return NextResponse.json({ ok: true })
  }

  try {
    const supabase = await createClient()

    // Si le firstName n'est pas fourni, essaie de le récupérer depuis
    // les metadata du user (stockés via options.data lors du signUp).
    let resolvedFirstName = firstName
    if (!resolvedFirstName) {
      const { data: userData } = await supabase.rpc('get_user_by_email', {
        p_email: email.trim().toLowerCase(),
      })

      // La RPC 'get_user_by_email' n'existe pas encore en prod ;
      // fallback sur la lecture directe via auth.admin (service_role requis)
      // ou silencieux si la RPC échoue — on utilise "Bienvenue" en fallback.
      if (userData && typeof userData === 'object' && 'raw_user_meta_data' in userData) {
        const meta = userData.raw_user_meta_data as Record<string, unknown> | null
        resolvedFirstName = (meta?.first_name ?? meta?.full_name ?? undefined) as string | undefined
      }
    }

    const greeting = resolvedFirstName
      ? `Bienvenue ${resolvedFirstName} !`
      : 'Bienvenue !'

    const htmlContent = await render(WelcomeEmail({ email: email.trim(), firstName: resolvedFirstName }))

    const resend = new Resend(resendApiKey)
    const { error: resendError } = await resend.emails.send({
      from: 'Emind <onboarding@emind.ai>',
      to: [email.trim().toLowerCase()],
      subject: greeting,
      html: htmlContent,
    })

    if (resendError) {
      console.error('[WelcomeEmail] Resend error:', resendError)
      return NextResponse.json({ error: 'Failed to send welcome email' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[WelcomeEmail] Unexpected error:', err)
    return NextResponse.json({ error: 'Failed to send welcome email' }, { status: 500 })
  }
}
