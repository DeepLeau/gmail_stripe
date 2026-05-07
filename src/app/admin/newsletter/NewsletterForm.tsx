'use client'

import { useState, useRef } from 'react'
import { Loader2, Mail, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type Status = 'idle' | 'submitting' | 'success' | 'error'

interface SendResult {
  sent: number
  failed: number
  errors: string[]
}

export function NewsletterForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [result, setResult] = useState<SendResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  const isSubmitting = status === 'submitting'
  const isSuccess = status === 'success'
  const isError = status === 'error'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMessage('')

    try {
      const res = await fetch('/api/admin/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, content }),
      })

      const data = await res.json()

      if (!res.ok) {
        const msg =
          (data && typeof data === 'object' && 'error' in data)
            ? String((data as { error: unknown }).error)
            : `Erreur ${res.status}`
        setErrorMessage(msg)
        setStatus('error')
        return
      }

      const parsed = data as SendResult
      setResult(parsed)
      setStatus('success')
    } catch {
      setErrorMessage('Une erreur réseau est survenue. Vérifiez votre connexion.')
      setStatus('error')
    }
  }

  function handleReset() {
    setStatus('idle')
    setSubject('')
    setContent('')
    setResult(null)
    setErrorMessage('')
  }

  function handleRetry() {
    setStatus('idle')
    setErrorMessage('')
    // fields preserved for correction
  }

  return (
    <div className="max-w-2xl">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Mail size={16} strokeWidth={1.5} className="text-[var(--accent)] shrink-0" />
          <h1
            className="text-base font-semibold text-[var(--text)]"
            style={{ letterSpacing: '-0.015em', lineHeight: 1.4 }}
          >
            Newsletter
          </h1>
        </div>
        <p className="text-sm text-[var(--text-2)]">
          Envoyez un email à tous les utilisateurs dont l&apos;adresse est vérifiée.
        </p>
      </div>

      {/* Success state */}
      {isSuccess && result !== null && (
        <div className="flex flex-col gap-3 mb-6">
          {/* Green badge */}
          <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20">
            <CheckCircle2
              size={16}
              strokeWidth={1.5}
              className="text-[var(--accent)] mt-0.5 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--accent)]">
                ✓ {result.sent} email{result.sent !== 1 ? 's' : ''} envoyé
                {result.sent !== 1 ? 's' : ''} avec succès
              </p>
            </div>
          </div>

          {/* Partial failure warning */}
          {result.failed > 0 && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-[#facc15]/10 border border-[#facc15]/20">
              <AlertCircle
                size={16}
                strokeWidth={1.5}
                className="text-[#ca8a04] mt-0.5 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#ca8a04]">
                  {result.failed} email{result.failed !== 1 ? 's' : ''} non
                  livrable{result.failed !== 1 ? 's' : ''}
                </p>
                {result.errors.length > 0 && (
                  <ul className="mt-1 flex flex-col gap-0.5">
                    {result.errors.slice(0, 5).map((err, i) => (
                      <li key={i} className="text-xs text-[#ca8a04]/70 font-mono">
                        {err}
                      </li>
                    ))}
                    {result.errors.length > 5 && (
                      <li className="text-xs text-[#ca8a04]/70">
                        …et {result.errors.length - 5} autre
                        {result.errors.length - 5 !== 1 ? 's' : ''} erreur
                        {result.errors.length - 5 !== 1 ? 's' : ''}
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* New newsletter button */}
          <button
            onClick={handleReset}
            className="self-start h-8 px-4 flex items-center justify-center gap-2 rounded-md text-xs font-medium transition-colors duration-150 border border-[var(--border-md)] bg-white/[0.03] hover:bg-white/[0.06] text-[var(--text-2)]"
          >
            <Mail size={13} strokeWidth={1.5} className="shrink-0" />
            Envoyer une nouvelle newsletter
            <ChevronRight size={12} strokeWidth={1.5} className="shrink-0" />
          </button>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-[var(--red)]/10 border border-[var(--red)]/20">
            <AlertCircle
              size={16}
              strokeWidth={1.5}
              className="text-[var(--red)] mt-0.5 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--red)]">
                Échec de l&apos;envoi
              </p>
              <p className="text-xs text-[var(--red)]/70 mt-0.5">{errorMessage}</p>
            </div>
          </div>
          <button
            onClick={handleRetry}
            className="self-start h-8 px-4 flex items-center justify-center gap-2 rounded-md text-xs font-medium transition-colors duration-150 border border-[var(--border-md)] bg-white/[0.03] hover:bg-white/[0.06] text-[var(--text-2)]"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Form — hidden on success */}
      {!isSuccess && (
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="flex flex-col gap-5"
        >
          {/* Sujet */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="subject"
              className="text-xs font-medium text-[var(--text-2)]"
            >
              Sujet
            </label>
            <input
              id="subject"
              name="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Sujet de la newsletter"
              required
              readOnly={isSubmitting}
              className={cn(
                'h-9 px-3 rounded-md text-sm transition-colors duration-150',
                'bg-[var(--surface)] border border-[var(--border-md)]',
                'text-[var(--text)] placeholder:text-[var(--text-3)]',
                'focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/15',
                'focus:border-[var(--accent)]/60',
                isSubmitting && 'opacity-60 cursor-not-allowed'
              )}
            />
          </div>

          {/* Contenu HTML */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="content"
              className="text-xs font-medium text-[var(--text-2)]"
            >
              Contenu (HTML)
            </label>
            <textarea
              id="content"
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="<p>Contenu HTML de la newsletter...</p>"
              required
              readOnly={isSubmitting}
              rows={10}
              className={cn(
                'w-full px-3 py-2.5 min-h-[200px] rounded-md text-sm resize-y',
                'bg-[var(--surface)] border border-[var(--border-md)]',
                'text-[var(--text)] placeholder:text-[var(--text-3)]',
                'focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/15',
                'focus:border-[var(--accent)]/60',
                'transition-colors duration-150 font-mono text-xs leading-relaxed',
                isSubmitting && 'opacity-60 cursor-not-allowed'
              )}
            />
            <p className="text-[11px] text-[var(--text-3)]">
              HTML autorisé. Utilisez des styles inline pour le rendu email.
            </p>
          </div>

          {/* Submit button */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                'h-9 px-5 flex items-center justify-center gap-2 rounded-md text-xs font-medium',
                'transition-colors duration-150',
                isSubmitting
                  ? 'bg-[var(--accent)]/70 cursor-not-allowed'
                  : 'bg-[var(--accent)] hover:bg-[var(--accent-hi)] shadow-[0_0_12px_var(--accent-glow)]'
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2
                    size={13}
                    strokeWidth={1.5}
                    className="animate-spin shrink-0"
                  />
                  Envoi en cours…
                </>
              ) : (
                <>
                  <Mail size={13} strokeWidth={1.5} className="shrink-0" />
                  Envoyer la newsletter
                </>
              )}
            </button>

            {isSubmitting && (
              <p className="text-xs text-[var(--text-3)] animate-pulse">
                Envoi en cours — ne fermez pas la page
              </p>
            )}
          </div>
        </form>
      )}
    </div>
  )
}
