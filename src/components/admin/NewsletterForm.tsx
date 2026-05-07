'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, X, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'

type FormStatus = 'idle' | 'sending' | 'success' | 'error'

interface SendResult {
  sent: number
  failed: number
  errors: string[]
  jobId?: string
}

interface NewsletterFormProps {
  subscriberCount: number
}

export function NewsletterForm({ subscriberCount }: NewsletterFormProps) {
  const [subject, setSubject] = useState('')
  const [htmlContent, setHtmlContent] = useState('')
  const [status, setStatus] = useState<FormStatus>('idle')
  const [showConfirm, setShowConfirm] = useState(false)
  const [result, setResult] = useState<SendResult | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Fermer modal clic extérieur
  useEffect(() => {
    if (!showConfirm) return
    const handler = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setShowConfirm(false)
      }
    }
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowConfirm(false)
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('keydown', escHandler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('keydown', escHandler)
    }
  }, [showConfirm])

  const canSubmit =
    subject.trim().length > 0 &&
    htmlContent.trim().length > 0 &&
    subscriberCount > 0 &&
    status !== 'sending'

  async function handleSend() {
    setShowConfirm(false)
    setStatus('sending')
    setApiError(null)
    setResult(null)

    try {
      const res = await fetch('/api/admin/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: subject.trim(), htmlContent: htmlContent.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        const message =
          typeof data?.error === 'string' ? data.error : `Erreur ${res.status}`
        throw new Error(message)
      }

      setResult({
        sent: data.sent ?? 0,
        failed: data.failed ?? 0,
        errors: Array.isArray(data.errors) ? data.errors : [],
        jobId: data.jobId,
      })
      setStatus('success')
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Une erreur est survenue.')
      setStatus('error')
    }
  }

  function handleRetry() {
    setStatus('idle')
    setApiError(null)
    setResult(null)
  }

  // ── Rapport de succès ──────────────────────────────────────────────────────
  if (status === 'success' && result) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-[var(--green)]/10 border border-[var(--green)]/20">
          <CheckCircle
            size={16}
            className="text-[var(--green)] mt-0.5 shrink-0"
            strokeWidth={1.5}
          />
          <div>
            <p className="text-sm font-medium text-[var(--green)]">
              Newsletter envoyée
            </p>
            <p className="text-xs text-[var(--text-2)] mt-0.5">
              {result.sent} email{result.sent !== 1 ? 's' : ''} envoyé
              {result.sent !== 1 ? 's' : ''}
              {result.failed > 0 &&
                `, ${result.failed} échec${result.failed !== 1 ? 's' : ''}`}
              .
            </p>
          </div>
        </div>

        {result.errors.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-[var(--text-3)] uppercase tracking-wider">
              Erreurs rencontrées
            </p>
            <div className="flex flex-col border border-[var(--border)] rounded-lg overflow-hidden">
              {result.errors.map((err, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 px-4 py-2.5 border-b border-[var(--border)] last:border-0 bg-white/[0.02]"
                >
                  <AlertCircle
                    size={12}
                    className="text-[var(--red)] mt-0.5 shrink-0"
                    strokeWidth={1.5}
                  />
                  <p className="text-xs text-[var(--text-2)] font-mono">{err}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleRetry}
          className="h-8 px-4 flex items-center justify-center gap-2 rounded-md border border-[var(--border-md)] bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--text-2)] text-xs font-medium transition-colors duration-150 self-start"
        >
          <RefreshCw size={12} strokeWidth={1.5} />
          Envoyer une autre
        </button>
      </div>
    )
  }

  // ── État erreur ─────────────────────────────────────────────────────────────
  if (status === 'error') {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-[var(--red)]/10 border border-[var(--red)]/20">
          <AlertCircle
            size={16}
            className="text-[var(--red)] mt-0.5 shrink-0"
            strokeWidth={1.5}
          />
          <div>
            <p className="text-sm font-medium text-[var(--red)]">
              Échec de l&apos;envoi
            </p>
            <p className="text-xs text-[var(--text-2)] mt-0.5">{apiError}</p>
          </div>
        </div>
        <button
          onClick={handleRetry}
          className="h-8 px-4 flex items-center justify-center gap-2 rounded-md border border-[var(--border-md)] bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--text-2)] text-xs font-medium transition-colors duration-150 self-start"
        >
          <RefreshCw size={12} strokeWidth={1.5} />
          Réessayer
        </button>
      </div>
    )
  }

  // ── Formulaire ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5">
      {/* Indicateur nombre d'inscrits */}
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
        <span className="text-xs text-[var(--text-3)]">Inscrits actifs :</span>
        <span className="text-sm font-semibold text-[var(--text)] tabular-nums">
          {subscriberCount > 0 ? subscriberCount.toLocaleString('fr-FR') : '0'}
        </span>
        {subscriberCount === 0 && (
          <span className="text-xs text-[var(--text-3)]">
            — impossible d&apos;envoyer tant qu&apos;il n&apos;y a aucun inscrit
          </span>
        )}
      </div>

      {/* Champ sujet */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="subject"
          className="text-xs font-medium text-[var(--text-2)]"
        >
          Sujet
        </label>
        <input
          id="subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Objet de l'email"
          disabled={status === 'sending'}
          className="h-9 px-3 rounded-md text-sm text-[var(--text)] bg-[var(--surface)] border border-[var(--border-md)] placeholder:text-[var(--text-3)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/15 focus:border-[var(--accent)]/60 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Champ contenu HTML */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="htmlContent"
          className="text-xs font-medium text-[var(--text-2)]"
        >
          Contenu HTML
        </label>
        <textarea
          id="htmlContent"
          value={htmlContent}
          onChange={(e) => setHtmlContent(e.target.value)}
          placeholder="<p>Votre contenu HTML...</p>"
          rows={10}
          disabled={status === 'sending'}
          className="w-full px-3 py-2.5 rounded-md text-sm font-mono resize-none text-[var(--text)] bg-[var(--surface)] border border-[var(--border-md)] placeholder:text-[var(--text-3)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/15 focus:border-[var(--accent)]/60 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <p className="text-[11px] text-[var(--text-3)]">
          Contenu HTML brut — utilisez les balises standard (p, h1, a, etc.).
        </p>
      </div>

      {/* Bouton envoi */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowConfirm(true)}
          disabled={!canSubmit}
          className="h-9 px-5 flex items-center justify-center gap-2 rounded-md bg-[var(--accent)] hover:bg-[var(--accent-hi)] text-white text-sm font-medium shadow-[0_0_12px_var(--accent-glow)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send size={14} strokeWidth={1.5} />
          Envoyer
        </button>
        {status === 'sending' && (
          <span className="text-xs text-[var(--text-3)] flex items-center gap-1.5">
            <RefreshCw size={12} className="animate-spin" />
            Envoi en cours...
          </span>
        )}
      </div>

      {/* Modal de confirmation */}
      {showConfirm && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowConfirm(false)}
        >
          <div
            ref={modalRef}
            className="w-full max-w-md bg-[var(--surface)] border border-[var(--border-md)] rounded-xl shadow-2xl"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
              <h2 className="text-sm font-semibold text-[var(--text)]">
                Confirmer l&apos;envoi
              </h2>
              <button
                onClick={() => setShowConfirm(false)}
                className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[var(--surface-2)] text-[var(--text-3)] hover:text-[var(--text-2)] transition-colors duration-150"
              >
                <X size={14} />
              </button>
            </div>

            <div className="px-5 py-5">
              <p className="text-sm text-[var(--text-2)] leading-relaxed">
                Vous êtes sur le point d&apos;envoyer un email à{' '}
                <span className="font-semibold text-[var(--text)]">
                  {subscriberCount.toLocaleString('fr-FR')}
                </span>{' '}
                inscrit{subscriberCount !== 1 ? 's' : ''} actif
                {subscriberCount !== 1 ? 's' : ''}.
              </p>
              <p className="text-xs text-[var(--text-3)] mt-2">
                Sujet : {subject || '(vide)'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[var(--border)]">
              <button
                onClick={() => setShowConfirm(false)}
                className="h-8 px-4 flex items-center justify-center rounded-md border border-[var(--border-md)] bg-[var(--surface-2)] hover:bg-[var(--surface)] text-[var(--text-2)] text-xs font-medium transition-colors duration-150"
              >
                Annuler
              </button>
              <button
                onClick={handleSend}
                className="h-8 px-4 flex items-center justify-center gap-2 rounded-md bg-[var(--accent)] hover:bg-[var(--accent-hi)] text-white text-xs font-medium transition-colors duration-150"
              >
                <Send size={12} strokeWidth={1.5} />
                Confirmer l&apos;envoi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
