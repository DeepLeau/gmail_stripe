export const dynamic = 'force-dynamic'

import { NewsletterForm } from '@/components/admin/NewsletterForm'

export default function AdminNewsletterPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <header className="mb-8">
        <p className="text-xs font-medium text-[var(--text-3)] uppercase tracking-wider mb-2">
          Administration
        </p>
        <h1 className="text-base font-semibold text-[var(--text-1)] tracking-tight">
          Newsletter
        </h1>
        <p className="text-sm text-[var(--text-3)] mt-1">
          Rédigez et envoyez une newsletter à tous vos utilisateurs inscrits.
        </p>
      </header>

      <NewsletterForm />
    </div>
  )
}
