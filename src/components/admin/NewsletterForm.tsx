'use client'

import { useState, useTransition } from 'react'
import { Mail, Loader2, AlertCircle, CheckCircle2, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { sendNewsletterAction } from '@/app/actions/admin/newsletter'

export interface NewsletterFormResult {
  sent: number
  errors: number
}

export interface NewsletterFormProps {
  onSuccess?: (result: NewsletterFormResult) => void
}

type FormStatus = 'idle' | 'sending' | 'success' | 'error'

function RefreshCwIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  )
}

export function NewsletterForm({ onSuccess }: NewsletterFormProps) {
  const [status, setStatus] = useState<FormStatus>('idle')
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [result, setResult] = useState<NewsletterFormResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const isSending = status === 'sending' || isPending

  const isSubjectValid = subject.trim().length > 0 && subject.length <= 200
  const isContentValid = content.trim().length >= 10
  const isFormValid = isSubjectValid && isContentValid

  function handleReset() {
    setStatus('idle')
    setSubject('')
    setContent('')
    setResult(null)
    setErrorMessage(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!isFormValid) return

    setErrorMessage(null)

    startTransition(async () => {
      setStatus('sending')

      try {
        const response = await sendNewsletterAction(subject.trim(), content.trim())

        if (!response.success) {
          setErrorMessage(response.error ?? 'Une erreur est survenue.')
          setStatus('error')
          return
        }

        const formResult: NewsletterFormResult = {
          sent: response.sent ?? 0,
          errors: response.errors ?? 0,
        }
        setResult(formResult)
        setStatus('success')
        onSuccess?.(formResult)
      } catch {
        setErrorMessage('Une erreur inattendue est survenue. Veuillez réessayer.')
        setStatus('error')
      }
    })
  }

  return (
    <div className="max-w-2xl">
      {/* Form card */}
      <div className="bg-[var(--surface-1)] border border-[var(--border-md)] rounded-lg overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border)]">
          <div className="w-7 h-7 rounded-md bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center shrink-0">
            <Mail size={14} className="text-[var(--accent-hi)]" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text-1)]">Nouvelle newsletter</p>
            <p className="text-xs text-[var(--text-3)]">Envoyée à tous les utilisateurs inscrits</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-5">
          {/* Subject field */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="subject" className="text-xs font-medium text-[var(--text-2)]">
              Sujet
            </label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={200}
              placeholder="Annonce importante — Nouvelle fonctionnalité"
              disabled={isSending}
              required
              className={cn(
                'h-9 px-3 rounded-md text-sm transition-colors duration-150',
                'bg-[var(--surface-1)] border text-[var(--text-1)] placeholder:text-[var(--text-3)]',
                'focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/15',
                !isSubjectValid && subject.length > 0
                  ? 'border-[var(--red)] focus:border-[var(--red)]'
                  : 'border-[var(--border-md)] focus:border-[var(--accent)]/60',
                isSending && 'opacity-50 cursor-not-allowed'
              )}
            />
            <div className="flex items-center justify-between">
              {!isSubjectValid && subject.length > 0 ? (
                <p className="text-[11px] text-[var(--red)] flex items-center gap-1">
                  <AlertCircle size={11} className="shrink-0" />
                  Le sujet est requis (max. 200 caractères)
                </p>
              ) : (
                <span />
              )}
              <span
                className={cn(
                  'text-[11px] tabular-nums shrink-0 ml-auto pl-2',
                  subject.length >= 180 ? 'text-[var(--yellow)]' : 'text-[var(--text-3)]'
                )}
              >
                {subject.length}/200
              </span>
            </div>
          </div>

          {/* Content field */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="content" className="text-xs font-medium text-[var(--text-2)]">
              Contenu
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              minLength={10}
              rows={10}
              placeholder="Bonjour,&#10;&#10;Nous avons une grande annonce à vous faire..."
              disabled={isSending}
              required
              className={cn(
                'w-full px-3 py-2.5 rounded-md text-sm resize-none transition-colors duration-150',
                'bg-[var(--surface-1)] border border-[var(--border-md)]',
                'text-[var(--text-1)] placeholder:text-[var(--text-3)]',
                'focus:outline-none focus:border-[var(--accent)]/60 focus:ring-2 focus:ring-[var(--accent)]/15',
                !isContentValid && content.length > 0 && 'border-[var(--red)]',
                isSending && 'opacity-50 cursor-not-allowed'
              )}
            />
            {!isContentValid && content.length > 0 && (
              <p className="text-[11px] text-[var(--red)] flex items-center gap-1">
                <AlertCircle size={11} className="shrink-0" />
                Le contenu doit contenir au moins 10 caractères
              </p>
            )}
          </div>

          {/* Submit button */}
          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={isSending || !isFormValid}
              className={cn(
                'h-9 px-5 flex items-center justify-center gap-2 rounded-md text-sm font-medium',
                'transition-colors duration-150',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                isFormValid && !isSending
                  ? 'bg-[var(--accent)] hover:bg-[var(--accent-hi)] text-white shadow-[0_0_12px_var(--accent-glow)]'
                  : 'bg-[var(--accent)] text-white'
              )}
            >
              {isSending ? (
                <>
                  <Loader2 size={14} className="animate-spin shrink-0" />
                  Envoi en cours…
                </>
              ) : (
                <>
                  <Send size={14} className="shrink-0" strokeWidth={1.5} />
                  Envoyer à tous les utilisateurs
                </>
              )}
            </button>
          </div>
        </form>

        {/* Success state */}
        {status === 'success' && result && (
          <div className="mx-5 mb-5 p-4 rounded-lg bg-[var(--green)]/10 border border-[var(--green)]/20">
            <div className="flex items-start gap-3">
              <CheckCircle2
                size={16}
                className="text-[var(--green)] mt-0.5 shrink-0"
                strokeWidth={1.5}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[var(--green)]">
                  Newsletter envoyée avec succès
                </p>
                <p className="text-xs text-[var(--green)]/70 mt-0.5">
                  {result.sent} email{result.sent !== 1 ? 's' : ''} envoyé
                  {result.sent !== 1 ? 's' : ''}
                  {result.errors > 0 && (
                    <span>, {result.errors} erreur{result.errors !== 1 ? 's' : ''}</span>
                  )}
                </p>
              </div>
              <button
                onClick={handleReset}
                className="shrink-0 h-7 px-3 flex items-center justify-center gap-1.5 rounded-md
                           border border-[var(--green)]/30 bg-[var(--green)]/10
                           hover:bg-[var(--green)]/15 text-[var(--green)] text-xs font-medium
                           transition-colors duration-150"
              >
                Nouvelle newsletter
              </button>
            </div>
          </div>
        )}

        {/* Error state */}
        {status === 'error' && (
          <div className="mx-5 mb-5 p-4 rounded-lg bg-[var(--red)]/10 border border-[var(--red)]/20">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={16}
                className="text-[var(--red)] mt-0.5 shrink-0"
                strokeWidth={1.5}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[var(--red)]">Échec de l'envoi</p>
                {errorMessage && (
                  <p className="text-xs text-[var(--red)]/70 mt-0.5">{errorMessage}</p>
                )}
              </div>
              <button
                onClick={handleReset}
                className="shrink-0 h-7 px-3 flex items-center justify-center gap-1.5 rounded-md
                           border border-[var(--red)]/25 bg-[var(--red)]/[0.06]
                           hover:bg-[var(--red)]/10 text-[var(--red)] text-xs font-medium
                           transition-colors duration-150"
              >
                <RefreshCwIcon size={11} className="shrink-0" />
                Réessayer
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-[var(--text-3)] mt-3 px-1">
        Les emails sont envoyés par lot de 100 via Resend. L&apos;envoi peut prendre plusieurs
        minutes selon le nombre d&apos;utilisateurs.
      </p>
    </div>
  )
}
