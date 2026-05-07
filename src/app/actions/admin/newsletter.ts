/**
 * src/app/actions/admin/newsletter.ts
 *
 * Server Action 'use server'.
 * Prend subject et content en paramètres, appelle la logique métier,
 * retourne { success, sent?, errors?, error? } pour NewsletterForm.
 *
 * Appelle la logique métier directement (pas d'appel HTTP interne) —
 * pattern optimal pour une Server Action Next.js App Router.
 */
'use server'

import { sendNewsletterBatch } from '@/lib/email/newsletter'
import { createClient } from '@/lib/supabase/server'
import { createHash } from 'crypto'

export interface SendNewsletterResult {
  success: boolean
  sent?: number
  errors?: number
  error?: string
}

/**
 * Récupère la liste des emails admin depuis la variable d'environnement.
 */
function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS
  if (!raw || raw.trim().length === 0) {
    return []
  }
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

function isAdminEmail(email: string | undefined): boolean {
  if (!email) return false
  return getAdminEmails().includes(email.toLowerCase())
}

/**
 * Server Action : envoie une newsletter à tous les utilisateurs.
 *
 * @param subject  Sujet de la newsletter (required, max 200 chars)
 * @param content  Contenu de la newsletter (required, min 10 chars)
 * @returns SendNewsletterResult
 */
export async function sendNewsletterAction(
  subject: string,
  content: string
): Promise<SendNewsletterResult> {
  // ── Validation des entrées ──────────────────────────────────────────────
  if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
    return { success: false, error: 'Le sujet est requis.' }
  }

  if (subject.trim().length > 200) {
    return { success: false, error: 'Le sujet ne peut pas dépasser 200 caractères.' }
  }

  if (!content || typeof content !== 'string' || content.trim().length < 10) {
    return { success: false, error: 'Le contenu doit contenir au moins 10 caractères.' }
  }

  const trimmedSubject = subject.trim()
  const trimmedContent = content.trim()

  // ── Auth + check admin ───────────────────────────────────────────────────
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Vous devez être connecté.' }
    }

    if (!isAdminEmail(user.email)) {
      return { success: false, error: "Vous n'avez pas les droits admin." }
    }

    const userEmail = user.email

    // ── Récupérer la liste des utilisateurs (service role) ──────────────────
    const { createClient: createAdmin } = await import('@supabase/supabase-js')
    const admin = createAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const { data: usersData, error: listError } = await admin.auth.admin.listUsers()

    if (listError) {
      console.error('[newsletter/action] listUsers failed:', listError)
      return { success: false, error: 'Impossible de récupérer la liste des utilisateurs.' }
    }

    const userEmails = (usersData.users ?? [])
      .map((u) => u.email)
      .filter((email): email is string => Boolean(email && email.trim().length > 0))

    // ── Construire la clé d'idempotence ─────────────────────────────────────
    // Stable : même admin + même contenu = même clé = pas de double-envoi
    const contentHash = createHash('sha256')
      .update(`${trimmedSubject}|${trimmedContent.slice(0, 100)}`)
      .digest('hex')
      .slice(0, 12)
    const today = new Date().toISOString().slice(0, 10)
    const idempotencyBase = `newsletter-${user.id}-${today}-${contentHash}`

    // ── Envoyer la newsletter ────────────────────────────────────────────────
    const result = await sendNewsletterBatch(
      userEmails,
      trimmedSubject,
      trimmedContent,
      idempotencyBase
    )

    console.info('[newsletter/action] sent', {
      admin: userEmail,
      subject: trimmedSubject,
      recipientCount: userEmails.length,
      sent: result.sent,
      errors: result.errors,
    })

    return {
      success: true,
      sent: result.sent,
      errors: result.errors,
    }
  } catch (err) {
    console.error('[newsletter/action] unexpected error:', err)
    return {
      success: false,
      error: "Une erreur inattendue s'est produite. Veuillez réessayer.",
    }
  }
}
