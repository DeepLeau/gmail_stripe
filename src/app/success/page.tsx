import Link from 'next/link'
import { CheckCircle2, ArrowRight } from 'lucide-react'

interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams
  const sessionId = params.session_id

  return (
    <main
      className="min-h-screen flex items-center justify-center px-6"
      style={{ backgroundColor: 'var(--surface)' }}
    >
      <div className="w-full max-w-sm">
        {/* Card */}
        <div
          className="rounded-2xl p-8 text-center"
          style={{
            backgroundColor: 'var(--bg)',
            border: '1px solid var(--border)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          }}
        >
          {/* Icon */}
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
            }}
          >
            <CheckCircle2
              size={28}
              style={{ color: '#22c55e' }}
              strokeWidth={1.5}
            />
          </div>

          {/* Title */}
          <h1
            className="text-xl font-semibold tracking-tight mb-2"
            style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}
          >
            Paiement confirmé
          </h1>

          {/* Description */}
          <p
            className="text-sm mb-6"
            style={{ color: 'var(--text-2)', lineHeight: 1.6 }}
          >
            Ton abonnement a bien été activé. Tu peux maintenant créer ton compte et profiter d&apos;Emind.
          </p>

          {/* CTA */}
          <Link
            href={sessionId ? `/signup?session_id=${sessionId}` : '/signup'}
            className="h-10 px-5 inline-flex items-center justify-center gap-2 rounded-lg
                       bg-[var(--accent)] hover:bg-[var(--accent-hi)] text-white
                       text-sm font-medium transition-colors duration-150
                       w-full"
          >
            <span>Créer mon compte</span>
            <ArrowRight size={15} strokeWidth={2} />
          </Link>
        </div>

        {/* Back link */}
        <p
          className="text-xs text-center mt-4"
          style={{ color: 'var(--text-3)' }}
        >
          <Link href="/" className="hover:underline underline-offset-2">
            Retour à l&apos;accueil
          </Link>
        </p>
      </div>
    </main>
  )
}
