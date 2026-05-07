import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { sendNewsletterBatch, buildNewsletterHtml } from '@/lib/email/newsletter'

export const dynamic = 'force-dynamic'

interface SendNewsletterBody {
  subject: string
  htmlContent: string
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0
}

/**
 * POST /api/admin/newsletter/send
 *
 * Authentification : session via cookies (via le helper standard).
 * Autorisation      : RPC is_admin() qui vérifie user_roles.role IN ('admin', 'owner').
 * Données           : service_role pour lire newsletter_subscriptions (pas de policy SELECT client).
 *
 * Réponse :
 *   200 { sent, failed, errors, jobId? }
 *   400 { error: "subject is required" | "content is required" }
 *   401 { error: "Unauthorized" }
 *   403 { error: "Forbidden" }
 *   500 { error: "..." }
 */
export async function POST(request: Request) {
  // 1. Parse et valider le body
  let body: SendNewsletterBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  if (!isNonEmptyString(body.subject)) {
    return NextResponse.json({ error: 'subject is required' }, { status: 400 })
  }
  if (!isNonEmptyString(body.htmlContent)) {
    return NextResponse.json({ error: 'content is required' }, { status: 400 })
  }

  // 2. Authentifier l'utilisateur via cookies
  let userId: string
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    userId = user.id
  } catch (err) {
    console.error('[admin/newsletter/send] auth error', err)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 3. Vérifier le rôle admin via la RPC is_admin()
  let isAdmin: boolean
  try {
    const supabase = await createClient()
    const { data, error: rpcError } = await supabase.rpc('is_admin')
    if (rpcError) {
      console.error('[admin/newsletter/send] is_admin RPC error', rpcError)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    isAdmin = data === true
  } catch (err) {
    console.error('[admin/newsletter/send] is_admin check error', err)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // 4. Récupérer la liste des inscrits via service_role
  // (pas de policy SELECT newsletter_subscriptions pour le client authenticated)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[admin/newsletter/send] missing service_role key')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }

  const adminClient = createServiceClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })

  let subscribers: string[] = []
  try {
    const { data, error: fetchError } = await adminClient
      .from('newsletter_subscriptions')
      .select('email')
      .eq('subscribed', true)

    if (fetchError) {
      console.error('[admin/newsletter/send] failed to fetch subscribers', fetchError)
      return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 })
    }

    subscribers = (data ?? []).map((row) => row.email).filter(Boolean)
  } catch (err) {
    console.error('[admin/newsletter/send] subscriber fetch error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }

  if (subscribers.length === 0) {
    return NextResponse.json({ sent: 0, failed: 0, errors: [] })
  }

  // 5. Construire le HTML de la newsletter
  const htmlBody = buildNewsletterHtml(body.subject, body.htmlContent)

  // 6. Envoyer en batch via Resend
  let result: Awaited<ReturnType<typeof sendNewsletterBatch>>
  try {
    result = await sendNewsletterBatch(subscribers, body.subject, htmlBody)
  } catch (err) {
    console.error('[admin/newsletter/send] resend batch error', err)
    return NextResponse.json(
      { error: 'email_send_failed' },
      { status: 500 }
    )
  }

  // 7. Log serveur pour audit trail
  console.info('[admin/newsletter/send] batch completed', {
    adminUserId: userId,
    recipientCount: subscribers.length,
    sent: result.sent,
    failed: result.failed,
    batchId: result.batchId,
  })

  return NextResponse.json({
    sent: result.sent,
    failed: result.failed,
    errors: result.errors,
    jobId: result.batchId,
  })
}
