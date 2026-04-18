'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, AlertCircle } from 'lucide-react'

type PageState = 'loading' | 'success' | 'error'

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const [pageState, setPageState] = useState<PageState>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const verifyAndRedirect = async () => {
      const params = new URLSearchParams(window.location.search)
      const sessionId = params.get('session_id')

      if (!sessionId) {
        setErrorMessage('Session introuvable. Merci de réessayer.')
        setPageState('error')
        return
      }

      try {
        const res = await fetch(`/api/checkout/verify?session_id=${sessionId}`)

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          setErrorMessage(data.error ?? 'Une erreur est survenue lors de la vérification.')
          setPageState('error')
          return
        }

        setPageState('success')

        // Redirect to /chat after a short delay
        setTimeout(() => {
          router.push('/chat')
          router.refresh()
        }, 1500)
      } catch {
        setErrorMessage('Connexion perdue. Vérifie ta connexion et réessaie.')
        setPageState('error')
      }
    }

    verifyAndRedirect()
  }, [router])

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6">
      {pageState === 'loading' && (
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2
            size={32}
            strokeWidth={1.5}
            className="animate-spin"
            style={{ color: 'var(--accent)' }}
          />
          <div>
            <p
              className="text-base font-medium mb-1"
              style={{ color: 'var(--text)' }}
            >
              Finalisation de votre abonnement…
            </p>
            <p className="text-sm" style={{ color: 'var(--text-2)' }}>
             Merci de patienter quelques secondes.
            </p>
          </div>
        </div>
      )}

      {pageState === 'error' && (
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
          >
            <AlertCircle
              size={24}
              strokeWidth={1.5}
              style={{ color: 'var(--red)' }}
            />
          </div>
          <div>
            <p
              className="text-base font-medium mb-1"
              style={{ color: 'var(--text)' }}
            >
              Échec de la finalisation
            </p>
            <p className="text-sm" style={{ color: 'var(--text-2)' }}>
              {errorMessage}
            </p>
          </div>
          <a
            href="/"
            className="h-10 px-5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors duration-150"
            style={{
              backgroundColor: 'var(--accent)',
              color: '#fff',
            }}
          >
            Retour à l&apos;accueil
          </a>
        </div>
      )}

      {pageState === 'success' && (
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2
            size={32}
            strokeWidth={1.5}
            className="animate-spin"
            style={{ color: 'var(--accent)' }}
          />
          <div>
            <p
              className="text-base font-medium mb-1"
              style={{ color: 'var(--text)' }}
            >
              Abonnement confirmé !
            </p>
            <p className="text-sm" style={{ color: 'var(--text-2)' }}>
              Redirection vers votre espace chat…
            </p>
          </div>
        </div>
      )}
    </main>
  )
}
