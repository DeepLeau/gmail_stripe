export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NewsletterForm } from '@/components/admin/NewsletterForm'

export default async function AdminNewsletterPage() {
  const supabase = await createClient()

  // Compter les inscrits actifs (subscribed = true)
  const { count: subscriberCount, error: countError } = await supabase
    .from('newsletter_subscriptions')
    .select('id', { count: 'exact', head: true })
    .eq('subscribed', true)

  if (countError) {
    console.error('[admin/newsletter] count error:', countError)
  }

  const safeCount = countError ? 0 : (subscriberCount ?? 0)

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-base font-semibold text-[var(--text)] tracking-tight mb-1">
          Envoyer une newsletter
        </h1>
        <p className="text-sm text-[var(--text-2)]">
          Rédigez et envoyez un email à tous vos inscrits.
        </p>
      </div>

      <NewsletterForm subscriberCount={safeCount} />
    </div>
  )
}
