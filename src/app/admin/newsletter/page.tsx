import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { NewsletterForm } from '@/components/admin/NewsletterForm'
import { Mail } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminNewsletterPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) {
    notFound()
  }

  const adminEmailsRaw = process.env.ADMIN_EMAILS ?? ''
  const adminEmails = adminEmailsRaw
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean)

  const isAdmin = adminEmails.includes(user.email.toLowerCase())

  if (!isAdmin) {
    notFound()
  }

  return (
    <div className="w-full">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center shrink-0">
            <Mail size={15} className="text-[var(--accent-hi)]" strokeWidth={1.5} />
          </div>
          <h1 className="text-base font-semibold text-[var(--text-1)] tracking-tight">
            Newsletter
          </h1>
        </div>
        <p className="text-sm text-[var(--text-3)] pl-11">
          Envoyez un email à tous les utilisateurs vérifiés de la plateforme.
        </p>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <NewsletterForm />
      </div>
    </div>
  )
}
