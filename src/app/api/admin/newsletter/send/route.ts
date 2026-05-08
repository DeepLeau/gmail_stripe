/**
 * src/app/api/admin/newsletter/send/route.ts
 *
 * Route Handler pour l'envoi d'une newsletter en masse.
 *
 * Contrôles :
 * 1. Authentification (getUser côté serveur)
 * 2. Autorisation admin (ADMIN_EMAILS env var)
 * 3. Validation du body
 * 4. Récupération des destinataires via RPC en service_role
 * 5. Envoi via Resend Batch API
 *
 * Retourne 200 même en cas d'erreur partielle (batch 3/4 envoyé).
 * Retourne 500 uniquement en cas de crash total (pas de RPC, pas de Resend).
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

import { sendNewsletterBatch, buildNewsletterHtml } from '@/lib/email/newsletter'
import type { NewsletterResult } from '@/lib/email/newsletter'

export const dynamic = 'force-dynamic'

interface SendNewsletterBody {
  subject: string
  content: string
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0
}

function validateBody(
  body: unknown
): { ok: true; subject: string; content: string } | { ok: false; error: string } {
  if (body === null || typeof body !== 'object') {
    return { ok: false, error: 'invalid_body' }
  }
  const b = body as Record<string, unknown>
  if (!isNonEmptyString(b.subject)) {
    return { ok: false, error: 'subject is required and must be a non-empty string' }
  }
  if (!isNonEmptyString(b.content)) {
    return { ok: false, error: 'content is required and must be a non-empty string' }
  }
  return { ok: true, subject: (b.subject as string).trim(), content: (b.content as string).trim() }
}

/**
 * Récupère la liste des emails vérifiés via la RPC SECURITY DEFINER.
 * Appelé en service_role (bypass RLS) pour éviter la pagination de auth.admin.listUsers().
 */
async function fetchVerifiedUserEmails(): Promise<string[]> {
  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const emails: string[] = []
  let lastId: string | null = null

  // Paginer jusqu'à épuisement de la RPC (1000 lignes par appel)
  while (true) {
    const { data, error } = await admin.rpc('list_verified_user_emails_for_newsletter', {
      p_last_id: lastId,
    })

    if (error) {
      throw new Error(`RPC failed: ${error.message}`)
    }

    const rows = (data ?? []) as Array<{ id: string; email: string }>
    if (rows.length === 0) break

    for (const row of rows) {
      if (row.email) emails.push(row.email)
    }

    lastId = rows[rows.length - 1].id

    // Si moins de 1000 lignes → dernier batch
    if (rows.length < 1000) break
  }

  return emails
}

export async function POST(request: Request): Promise<NextResponse<NewsletterResult | { error: string }>> {
  // ── 1. Parse body ──────────────────────────────────────────────────────────
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 })
  }

  // ── 2. Validate body ───────────────────────────────────────────────────────
  const validation = validateBody(body)
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 })
  }

  const { subject, content } = validation

  // ── 3. Authenticate ────────────────────────────────────────────────────────
  let adminId: string
  let adminEmail: string
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    adminId = user.id
    adminEmail = user.email ?? ''
  } catch (err) {
    console.error('[newsletter/send] auth error:', err)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
  }

  // ── 4. Authorize admin ────────────────────────────────────────────────────
  const adminEmailsRaw = process.env.ADMIN_EMAILS ?? ''
  const adminEmails = adminEmailsRaw
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)

  if (!adminEmails.includes(adminEmail.toLowerCase())) {
    return NextResponse.json({ error: 'Forbidden — not an admin' }, { status: 403 })
  }

  // ── 5. Fetch recipients via RPC ────────────────────────────────────────────
  let recipients: string[]
  try {
    recipients = await fetchVerifiedUserEmails()
  } catch (err) {
    console.error('[newsletter/send] RPC error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch recipients. Please try again.' },
      { status: 500 }
    )
  }

  if (recipients.length === 0) {
    return NextResponse.json({ sent: 0, failed: 0, total: 0, errors: [] })
  }

  // ── 6. Idempotency key stable ───────────────────────────────────────────────
  // Basée sur (adminId, hashSujet, jour) — pas Date.now() ni Math.random()
  const contentHash = createHash('sha256')
    .update(`${subject}|${content}`)
    .digest('hex')
    .slice(0, 12)
  const today = new Date().toISOString().slice(0, 10)
  const idempotencyKeyBase = `newsletter-${adminId}-${today}-${contentHash}`

  // ── 7. Build HTML + send ───────────────────────────────────────────────────
  let result: NewsletterResult
  try {
    const html = buildNewsletterHtml(subject, content)
    // FIX: passer les 4 arguments requis (recipients, subject, html, idempotencyKeyBase)
    result = await sendNewsletterBatch(recipients, subject, html, idempotencyKeyBase)
  } catch (err) {
    console.error('[newsletter/send] Resend error:', err)
    return NextResponse.json(
      { error: 'Failed to send newsletter. Please try again.' },
      { status: 500 }
    )
  }

  // ── 8. Log pour audit trail ───────────────────────────────────────────────
  console.info('[newsletter/send] completed', {
    adminEmail,
    subject,
    total: result.total,
    sent: result.sent,
    failed: result.failed,
    errors: result.errors.length,
  })

  // Retourne NewsletterResult directement : { sent, failed, total, errors }
  return NextResponse.json(result)
}
