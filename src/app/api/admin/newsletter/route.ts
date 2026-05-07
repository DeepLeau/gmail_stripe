/**
 * POST /api/admin/newsletter
 *
 * Envoie une newsletter à tous les utilisateurs vérifiés via Resend Batch API.
 * Sécurité : allowlist email ADMIN_EMAILS vérifié en premier.
 * Performance : Resend Batch API avec idempotence stable par chunk.
 */
import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { getResend, FROM_EMAIL } from '@/lib/email/resend'
import { createClient } from '@/lib/supabase/server'
import { createHash } from 'crypto'

export const dynamic = 'force-dynamic'

const BATCH_SIZE = 100

interface NewsletterBody {
  subject: string
  html: string
}

interface BatchResult {
  sent: number
  failed: number
  errors: string[]
}

async function fetchVerifiedUsers(
  adminClient: Awaited<ReturnType<typeof getAdminClient>>
): Promise<string[]> {
  const allEmails: string[] = []
  let cursor: string | undefined

  do {
    const options: { cursor?: string } = cursor ? { cursor } : {}
    const { data, error } = await adminClient.auth.admin.listUsers(options as any)

    if (error) {
      console.error('[newsletter] listUsers failed', error)
      throw new Error('Failed to fetch users: ' + error.message)
    }

    // Filter verified users with a valid email
    const verifiedEmails = (data.users ?? [])
      .filter((u) => {
        const email = u.email ?? ''
        return u.confirmed_at !== null && email.trim() !== '' && email.includes('@')
      })
      .map((u) => u.email as string)

    allEmails.push(...verifiedEmails)
    cursor = data.next_cursor ?? undefined
  } while (cursor)

  return allEmails
}

async function sendInBatches(
  emails: string[],
  subject: string,
  html: string,
  idempotencyKey: string
): Promise<BatchResult> {
  const resend = getResend()
  let sent = 0
  let failed = 0
  const errors: string[] = []

  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const chunk = emails.slice(i, i + BATCH_SIZE)
    const chunkIndex = Math.floor(i / BATCH_SIZE)
    const batchKey = `${idempotencyKey}-${chunkIndex}`

    // Build batch items — each email entry carries from/subject/html,
    // to is the array of recipients for this batch
    const batchPayload = chunk.map((recipient) => ({
      from: FROM_EMAIL,
      to: [recipient],
      subject,
      html,
    }))

    try {
      const { data, error } = await resend.batch.send(batchPayload, {
        idempotencyKey: batchKey,
      } as any)

      if (error) {
        console.error('[resend] batch send failed', { chunkIndex, error })
        failed += chunk.length
        errors.push(`Chunk ${chunkIndex}: ${error.message}`)
        continue
      }

      // data is Batch[] — count entries with a resolved id as success
      const results = data?.data ?? []
      const successCount = results.filter((r: { id?: string }) => Boolean(r.id)).length
      sent += successCount
      failed += chunk.length - successCount

      if (successCount < chunk.length) {
        errors.push(
          `Chunk ${chunkIndex}: ${chunk.length - successCount} email(s) non delivered`
        )
      }
    } catch (err) {
      console.error('[resend] batch exception', { chunkIndex, err })
      failed += chunk.length
      errors.push(`Chunk ${chunkIndex}: Unexpected error`)
    }
  }

  return { sent, failed, errors }
}

function isAdminEmail(email: string | undefined): boolean {
  if (!email) return false
  const adminList = process.env.ADMIN_EMAILS ?? ''
  const allowed = adminList
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return allowed.includes(email.toLowerCase())
}

export async function POST(request: Request) {
  // 1. Authentification
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // 2. Autorisation — allowlist email
  if (!isAdminEmail(user.email)) {
    console.warn('[newsletter] forbidden access attempt', { email: user.email })
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  // 3. Validation du body
  let body: NewsletterBody
  try {
    body = (await request.json()) as NewsletterBody
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  const { subject, html } = body

  if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
    return NextResponse.json({ error: 'subject_required' }, { status: 400 })
  }

  if (subject.trim().length > 200) {
    return NextResponse.json({ error: 'subject_too_long' }, { status: 400 })
  }

  if (!html || typeof html !== 'string' || html.trim().length < 10) {
    return NextResponse.json({ error: 'content_required' }, { status: 400 })
  }

  if (html.length > 50_000) {
    return NextResponse.json({ error: 'content_too_long' }, { status: 400 })
  }

  // 4. Récupérer la liste des destinataires via service_role
  let recipientEmails: string[]
  try {
    const adminClient = getAdminClient()
    recipientEmails = await fetchVerifiedUsers(adminClient)
  } catch (err) {
    console.error('[newsletter] failed to fetch users', err)
    return NextResponse.json({ error: 'Failed to retrieve recipient list' }, { status: 500 })
  }

  if (recipientEmails.length === 0) {
    return NextResponse.json({ sent: 0, failed: 0, errors: [] }, { status: 200 })
  }

  // 5. Idempotency key stable — basée sur (contenu hash, date)
  const contentHash = createHash('sha256')
    .update(`${subject}|${html}`)
    .digest('hex')
    .slice(0, 12)
  const today = new Date().toISOString().slice(0, 10)
  const idempotencyKey = `newsletter-${user.id}-${today}-${contentHash}`

  // 6. Envoi via Resend Batch API
  let result: BatchResult
  try {
    result = await sendInBatches(recipientEmails, subject.trim(), html, idempotencyKey)
  } catch (err) {
    console.error('[newsletter] resend batch failed', err)
    return NextResponse.json({ error: 'Email delivery failed' }, { status: 500 })
  }

  console.info('[newsletter] sent', {
    adminEmail: user.email,
    subject: subject.trim(),
    recipients: recipientEmails.length,
    sent: result.sent,
    failed: result.failed,
  })

  return NextResponse.json(
    { sent: result.sent, failed: result.failed, errors: result.errors },
    { status: 200 }
  )
}
