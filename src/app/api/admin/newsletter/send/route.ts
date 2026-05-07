import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { getResend, FROM_EMAIL } from '@/lib/email/resend'

export const dynamic = 'force-dynamic'

// ─── Batch size — Resend hard limit
const BATCH_SIZE = 100

// ─── Validation
interface NewsletterBody {
  subject?: unknown
  content?: unknown
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0
}

function validateBody(body: NewsletterBody): { ok: true; subject: string; content: string } | { ok: false; error: string } {
  if (!isNonEmptyString(body.subject)) {
    return { ok: false, error: 'subject is required and must be a non-empty string' }
  }
  if (!isNonEmptyString(body.content)) {
    return { ok: false, error: 'content is required and must be a non-empty string' }
  }
  return { ok: true, subject: body.subject.trim(), content: body.content.trim() }
}

// ─── Idempotency key stable — basée sur (adminId, date, contenu)
// Cf. R12 : JAMAIS Date.now() ou Math.random()
function buildIdempotencyKey(adminId: string, subject: string, chunkIndex: number): string {
  const today = new Date().toISOString().slice(0, 10) // "2026-05-07"
  const subjectHash = createHash('sha256').update(subject).digest('hex').slice(0, 12)
  return `newsletter-${adminId}-${today}-${subjectHash}-chunk-${chunkIndex}`
}

// ─── Route handler
export async function POST(request: Request) {
  // 1. Parse body
  let body: NewsletterBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json_body' }, { status: 400 })
  }

  // 2. Validate body
  const validation = validateBody(body)
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 })
  }

  const { subject, content } = validation

  // 3. Authenticate user
  let userId: string
  let userEmail: string
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    userId = user.id
    userEmail = user.email ?? ''
  } catch (err) {
    console.error('[admin/newsletter/send] Auth error:', err)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
  }

  // 4. Check admin authorization — Pattern A: ADMIN_EMAILS env var
  const adminEmails = process.env.ADMIN_EMAILS ?? ''
  const allowedEmails = adminEmails
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

  if (!allowedEmails.includes(userEmail.toLowerCase())) {
    return NextResponse.json({ error: 'Forbidden — not an admin' }, { status: 403 })
  }

  // 5. Load all confirmed users via RPC SECURITY DEFINER (service_role)
  let recipientEmails: string[] = []
  try {
    const admin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: rows, error: rpcError } = await admin.rpc('list_all_users_for_admin')

    if (rpcError) {
      console.error('[admin/newsletter/send] RPC error:', rpcError)
      return NextResponse.json({ error: 'Failed to load recipients' }, { status: 500 })
    }

    // Extract emails from RPC result — safely handle missing fields
    if (Array.isArray(rows)) {
      recipientEmails = rows
        .map((row: unknown) => {
          const r = row as Record<string, unknown>
          return typeof r.email === 'string' && r.email.includes('@') ? r.email.trim().toLowerCase() : null
        })
        .filter((email): email is string => email !== null)
    }
  } catch (err) {
    console.error('[admin/newsletter/send] DB error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }

  // Empty recipients — return early with success zero
  if (recipientEmails.length === 0) {
    return NextResponse.json({ sent: 0, failed: 0, errors: [] })
  }

  // 6. Send via Resend Batch API in chunks of 100
  const resend = getResend()
  let totalSent = 0
  let totalFailed = 0
  const allErrors: string[] = []

  // Build a stable idempotency key base for this newsletter
  const today = new Date().toISOString().slice(0, 10)
  const subjectHash = createHash('sha256').update(subject).digest('hex').slice(0, 12)

  for (let i = 0; i < recipientEmails.length; i += BATCH_SIZE) {
    const chunk = recipientEmails.slice(i, i + BATCH_SIZE)
    const chunkIndex = Math.floor(i / BATCH_SIZE)

    // Stable idempotency key per chunk — survives retries
    const idempotencyKey = `newsletter-${userId}-${today}-${subjectHash}-chunk-${chunkIndex}`

    // Payload per email — from lives in the options object, not per payload
    const payloads = chunk.map((email) => ({
      to: [email],
      subject,
      html: content,
    }))

    const { data: batchData, error: batchError } = await resend.batch.send(payloads, {
      from: FROM_EMAIL,
      idempotencyKey,
    })

    if (batchError) {
      console.error(`[admin/newsletter/send] Batch ${chunkIndex} failed:`, batchError.message)
      totalFailed += chunk.length
      allErrors.push(`Batch ${chunkIndex}: ${batchError.message}`)
      // Continue processing remaining chunks — don't abort on partial failure
      continue
    }

    // Count successful sends — batchData is CreateBatchSuccessResponse[]
    type BatchItem = { id?: string; to?: string; created_at?: string; status?: string; message?: string }
    const batchItems = (batchData ?? []) as unknown as BatchItem[]
    const sentCount = batchItems.filter((item: BatchItem) => Boolean(item.id)).length
    totalSent += sentCount
    totalFailed += chunk.length - sentCount

    if (sentCount < chunk.length && sentCount > 0) {
      allErrors.push(
        `Batch ${chunkIndex}: ${chunk.length - sentCount}/${chunk.length} emails may have failed silently`
      )
    }
  }

  return NextResponse.json({
    sent: totalSent,
    failed: totalFailed,
    errors: allErrors,
  })
}
