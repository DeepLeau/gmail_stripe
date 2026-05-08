'use client'

import { useState } from 'react'
import { Send, CheckCircle2, XCircle, Loader2 } from 'lucide-react'

interface NewsletterSendResponse {
  sent: number
  failed: number
  total: number
  errors: string[]
}

type FormStatus = 'idle' | 'loading' | 'success' | 'error'

export function NewsletterForm() {
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<FormStatus>('idle')
  const [feedback, setFeedback] = useState('')

  function isValid(): boolean {
    return subject.trim().length > 0 && content.trim().length > 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!isValid()) {
      setStatus('error')
      setFeedback('Le sujet et le contenu ne peuvent pas être vides.')
      return
    }

    setStatus('loading')
    setFeedback('')

    try {
      const res = await fetch('/api/admin/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject.trim(),
          content: content.trim(),
        }),
      })

      const data: NewsletterSendResponse & { error?: string } = await res.json()

      if (!res.ok) {
        const message = data?.error ?? `Erreur ${res.status}`
        setStatus('error')
        setFeedback(message)
        return
      }

      setStatus('success')
      const total = data.total ?? data.sent
      setFeedback(`Newsletter envoyée à ${total} utilisateur${total !== 1 ? 's' : ''}.`)
      setSubject('')
      setContent('')
    } catch {
      setStatus('error')
      setFeedback('Une erreur de connexion est survenue. Veuillez réessayer.')
    }
  }

  const isLoading = status === 'loading'
  const isSuccess = status === 'success'
  const isError = status === 'error'

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5"
      noValidate
    >
      {/* Success / Error banner */}
      {isSuccess && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-[var(--green)]/[0.07] border border-[var(--green)]/20">
          <CheckCircle2 size={16} className="text-[var(--green)] mt-0.5 shrink-0" strokeWidth={1.5} />
          <p className="text-sm font-medium text-[var(--green)]">{feedback}</p>
        </div>
      )}

      {isError && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-[var(--red)]/[0.07] border border-[var(--red)]/20">
          <XCircle size={16} className="text-[var(--red)] mt-0.5 shrink-0" strokeWidth={1.5} />
          <p className="text-sm font-medium text-[var(--red)]">{feedback}</p>
        </div>
      )}

      {/* Subject field */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="newsletter-subject"
          className="text-xs font-medium text-[var(--text-2)]"
        >
          Sujet de l&apos;email
        </label>
        <input
          id="newsletter-subject"
          type="text"
          value={subject}
          onChange={e => {
            setSubject(e.target.value)
            if (isError) { setStatus('idle'); setFeedback('') }
          }}
          disabled={isLoading}
          placeholder="Votre sujet ici..."
          className={[
            'h-9 px-3 rounded-md text-sm transition-colors duration-150',
            'bg-[var(--surface-1)] border',
            'text-[var(--text-1)] placeholder:text-[var(--text-3)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/15',
            isLoading
              ? 'opacity-50 cursor-not-allowed border-[var(--border)]'
              : 'border-[var(--border-md)] focus:border-[var(--accent)]/60',
          ].join(' ')}
          autoComplete="off"
        />
      </div>

      {/* Content field */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="newsletter-content"
          className="text-xs font-medium text-[var(--text-2)]"
        >
          Contenu de l&apos;email
        </label>
        <textarea
          id="newsletter-content"
          rows={12}
          value={content}
          onChange={e => {
            setContent(e.target.value)
            if (isError) { setStatus('idle'); setFeedback('') }
          }}
          disabled={isLoading}
          placeholder="Rédigez le contenu de votre newsletter ici..."
          className={[
            'w-full px-3 py-2.5 rounded-md text-sm resize-none transition-colors duration-150',
            'bg-[var(--surface-1)] border',
            'text-[var(--text-1)] placeholder:text-[var(--text-3)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/15',
            isLoading
              ? 'opacity-50 cursor-not-allowed border-[var(--border)]'
              : 'border-[var(--border-md)] focus:border-[var(--accent)]/60',
          ].join(' ')}
        />
        <p className="text-[11px] text-[var(--text-3)]">
          Le contenu sera envoyé en HTML. Les sauts de ligne sont conservés.
        </p>
      </div>

      {/* Submit button */}
      <div className="flex items-center justify-end">
        <button
          type="submit"
          disabled={isLoading || !isValid()}
          className={[
            'h-8 px-4 flex items-center justify-center gap-2 rounded-md text-xs font-medium transition-colors duration-150',
            'bg-[var(--accent)] hover:bg-[var(--accent-hi)] text-white',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          ].join(' ')}
        >
          {isLoading ? (
            <>
              <Loader2 size={13} className="animate-spin shrink-0" />
              <span>Envoi en cours...</span>
            </>
          ) : (
            <>
              <Send size={13} className="shrink-0" strokeWidth={1.5} />
              <span>Envoyer la newsletter</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}
