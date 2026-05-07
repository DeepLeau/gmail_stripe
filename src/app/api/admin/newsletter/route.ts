/**
 * src/app/api/admin/newsletter/route.ts
 *
 * Route Handler POST /api/admin/newsletter
 *
 * Sécurité :
 * - Authentification : session Supabase obligatoire (401 si non connecté)
 * - Autorisation    : email de l'user dans ADMIN_EMAILS (403 si absent)
 * - Rate limit      : à implémenter via @upstash/ratelimit si volume élevé
 *
 * Corps attendu :
 *   { subject: string, content: string }
 *
 * Réponses :
 *   200 { sent: number, errors: number }
 *   401 { error: 'Unauthenticated' }
 *   403 { error: 'Forbidden — not an admin' }
 *   422 { error: 'Invalid body', details: string }
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'
import { sendNewsletterBatch, buildNewsletterHtml } from '@/lib/email/newsletter'

export const dynamic = 'force-dynamic'

interface NewsletterBody {
  subject: string
  content: string
}

function validateBody(body: unknown): body is NewsletterBody {
  if (typeof body !== 'object' || body === null) return false
  const b = body as Record<string, unknown>
  return (
    typeof b.subject === 'string' &&
    b.subject.trim().length > 0 &&
    b.subject.trim().length <= 200 &&
    typeof b.content === 'string' &&
    b.content.trim().length >= 10
  )
}

/**
 * Vérifie si l'email de l'user est dans la whitelist ADMIN_EMAILS.
 * ADMIN_EMAILS est une liste d'emails séparés par des virgules (format : 'a@b.com,c@d.com').
 */
function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  const whitelist = process.env.ADMIN_EMAILS ?? ''
  if (!whitelist) {
    console.warn(
      '[admin/newsletter] ADMIN_EMAILS env var is not set — denying all admin access'
    )
    return false
  }
  const allowed = whitelist.split(',').map((e) => e.trim().toLowerCase())
  return allowed.includes(email.trim().toLowerCase())
}

export async function POST(request: Request) {
  // ── 1. Authentification ────────────────────────────────────────────────────
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
  }

  // ── 2. Autorisation — whitelist email ───────────────────────────────────────
  if (!isAdminEmail(user.email)) {
    console.warn('[admin/newsletter] Access denied for', user.email)
    return NextResponse.json({ error: 'Forbidden — not an admin' }, { status: 403 })
  }

  // ── 3. Validation du body ───────────────────────────────────────────────────
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body', details: 'JSON malformé' }, { status: 422 })
  }

  if (!validateBody(body)) {
    const b = body as Record<string, unknown> | null
    const subjectErr =
      typeof b?.subject !== 'string'
        ? 'subject manquant ou invalide'
        : !b?.subject || (b.subject as string).trim().length === 0
          ? 'subject ne peut pas être vide'
          : (b.subject as string).trim().length > 200
            ? 'subject dépasse 200 caractères'
            : 'subject manquant'

    const contentErr =
      typeof b?.content !== 'string'
        ? 'content manquant ou invalide'
        : !b?.content || (b.content as string).trim().length < 10
          ? 'content doit contenir au moins 10 caractères'
          : 'content manquant'

    return NextResponse.json(
      { error: 'Invalid body', details: `${subjectErr}; ${contentErr}` },
      { status: 422 }
    )
  }

  // TypeScript sait maintenant que body est NewsletterBody (validateBody a narrowé)
  const { subject, content } = body as NewsletterBody

  // ── 4. Récupérer la liste des utilisateurs via RPC ─────────────────────────
  // On utilise le service_role pour bypasser la RLS de auth.users.
  // La RPC list_users_for_newsletter() est SECURITY DEFINER — elle liste
  // uniquement les users avec email confirmé.
  const adminSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data: users, error: rpcError } = await adminSupabase.rpc(
    'list_users_for_newsletter'
  )

  if (rpcError) {
    console.error('[admin/newsletter] RPC list_users_for_newsletter failed', rpcError)
    return NextResponse.json(
      { error: 'Failed to fetch users', details: rpcError.message },
      { status: 500 }
    )
  }

  const userRows = (users ?? []) as Array<{ id: string; email: string; created_at: string }>

  if (userRows.length === 0) {
    return NextResponse.json({ sent: 0, errors: 0, errorMessages: [] })
  }

  // ── 5. Construire la clé d'idempotence stable ──────────────────────────────
  // Stable : même admin + même contenu = même clé = pas de double-envoi.
  // Dérivée de : admin_id | date | hash(subject|content truncé à 100 premiers chars)
  const contentHash = createHash('sha256')
    .update(`${subject}|${content.slice(0, 100)}`)
    .digest('hex')
    .slice(0, 12)
  const today = new Date().toISOString().slice(0, 10) // "2026-05-07"
  const idempotencyBase = `newsletter-${user.id}-${today}-${contentHash}`

  // ── 6. Construire le HTML ───────────────────────────────────────────────────
  const htmlContent = buildNewsletterHtml(subject, content)

  // ── 7. Envoyer via Resend Batch ────────────────────────────────────────────
  const recipientEmails = userRows.map((u) => u.email)

  const result = await sendNewsletterBatch(
    recipientEmails,
    subject,
    htmlContent,
    idempotencyBase
  )

  // ── 8. Logger dans audit_log ───────────────────────────────────────────────
  // Insert asynchrone fire-and-forget — ne bloque pas la réponse
  // Utilise une IIFE async pour que le .catch() soit appeler proprement sur la Promise.
  // Sans wrapper async, le type de retour de insert() est PromiseLike<void>
  // (via la couche @supabase/ssr) qui n'a pas de méthode .catch() en mode strict.
  void (async () => {
    try {
      const { error: auditError } = await adminSupabase
        .from('newsletter_audit_log')
        .insert({
          admin_email: user.email!,
          subject,
          recipient_count: recipientEmails.length,
          status:
            result.errors === 0
              ? 'success'
              : result.sent === 0
                ? 'failed'
                : 'partial_failure',
          error_detail:
            result.errorMessages.length > 0
              ? result.errorMessages.slice(0, 10).join(' | ')
              : null,
          metadata: {
            sent: result.sent,
            errors: result.errors,
            batchIds: result.batchIds.slice(0, 5), // garder les 5 premiers IDs pour debug
          },
        })
      if (auditError) {
        console.error('[admin/newsletter] Failed to insert audit log', auditError)
      }
    } catch (err: unknown) {
      console.error('[admin/newsletter] Audit log insert threw', err)
    }
  })()

  // ── 9. Réponse ─────────────────────────────────────────────────────────────
  return NextResponse.json({
    sent: result.sent,
    errors: result.errors,
  })
}