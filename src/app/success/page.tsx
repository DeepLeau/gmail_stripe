import { createClient } from '@/lib/supabase/server'

interface PendingCheckout {
  plan: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_status: string
  linked_user_id: string | null
}

const PLAN_DISPLAY_NAMES: Record<string, string> = {
  starter: 'Starter',
  growth: 'Growth',
  pro: 'Pro',
}

async function verifyPendingCheckout(sessionId: string): Promise<{
  checkout: PendingCheckout | null
  error: string | null
}> {
  const supabase = await createClient()

  // Table pending_checkouts : RLS activé sans policy, donc lecture côté client = [].
  // Lecture server-side avec createClient (auth cookie) fonctionne si l'user est
  // authentifié. Pour le success page (user pas encore auth), on utilise
  // SUPABASE_SERVICE_ROLE_KEY via un fetch interne.
  const serviceSupabase = await import('@/lib/supabase/server').then(
    async ({ createClient }) => {
      const { createServerClient } = await import('@supabase/ssr')
      return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          cookies: { getAll: () => [], setAll: () => {} },
          auth: { persistSession: false, autoRefreshToken: false },
        }
      )
    }
  )

  const { data, error } = await serviceSupabase
    .from('pending_checkouts')
    .select('plan, stripe_customer_id, stripe_subscription_id, subscription_status, linked_user_id')
    .eq('stripe_session_id', sessionId)
    .maybeSingle()

  if (error || !data) {
    return { checkout: null, error: 'Session introuvable' }
  }

  return { checkout: data as PendingCheckout, error: null }
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const params = await searchParams
  const sessionId = params.session_id

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--surface)' }}>
        <div className="text-center max-w-sm mx-auto px-6">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>Session introuvable</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text-2)' }}>
            Impossible de vérifier votre paiement. Veuillez réessayer.
          </p>
          <a
            href="/#pricing"
            className="inline-flex items-center justify-center h-10 px-6 rounded-lg text-sm font-medium transition-colors duration-150"
            style={{
              backgroundColor: 'var(--accent)',
              color: '#fff',
            }}
          >
            Revenir aux tarifs
          </a>
        </div>
      </div>
    )
  }

  const { checkout, error } = await verifyPendingCheckout(sessionId)

  if (error || !checkout) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--surface)' }}>
        <div className="text-center max-w-sm mx-auto px-6">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>Erreur de vérification</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text-2)' }}>{error ?? 'Une erreur est survenue'}</p>
          <a
            href="/#pricing"
            className="inline-flex items-center justify-center h-10 px-6 rounded-lg text-sm font-medium transition-colors duration-150"
            style={{
              backgroundColor: 'var(--accent)',
              color: '#fff',
            }}
          >
            Revenir aux tarifs
          </a>
        </div>
      </div>
    )
  }

  if (checkout.linked_user_id) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--surface)' }}>
        <div className="text-center max-w-sm mx-auto px-6">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>Abonnement déjà lié</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text-2)' }}>
            Votre abonnement {PLAN_DISPLAY_NAMES[checkout.plan ?? ''] ?? checkout.plan} est déjà actif.
          </p>
          <a
            href="/chat"
            className="inline-flex items-center justify-center h-10 px-6 rounded-lg text-sm font-medium transition-colors duration-150"
            style={{
              backgroundColor: 'var(--accent)',
              color: '#fff',
            }}
          >
            Accéder à mes emails
          </a>
        </div>
      </div>
    )
  }

  const planName = PLAN_DISPLAY_NAMES[checkout.plan ?? ''] ?? checkout.plan ?? 'votre plan'

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--surface)' }}>
      <div className="text-center max-w-sm mx-auto px-6">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text)' }}>Paiement confirmé !</h1>
        <p className="text-sm mb-1" style={{ color: 'var(--text-2)' }}>
          Votre abonnement <strong>{planName}</strong> est prêt.
        </p>
        <p className="text-sm mb-8" style={{ color: 'var(--text-2)' }}>
          Créez votre compte pour activer votre abonnement.
        </p>
        <a
          href={`/signup?session_id=${sessionId}`}
          className="inline-flex items-center justify-center h-11 px-6 rounded-lg text-sm font-medium transition-colors duration-150 gap-2"
          style={{
            backgroundColor: 'var(--accent)',
            color: '#fff',
          }}
        >
          Créer mon compte
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>
      </div>
    </div>
  )
}
