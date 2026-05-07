'use client'

import { useState } from 'react'
import { Send, Loader2, Eye, EyeOff, RefreshCw, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type FormState = 'idle' | 'sending' | 'success' | 'error'

interface NewsletterResult {
  sent: number
  failed: number
}

interface NewsletterFormProps {
  onSend: (subject: string, html: string) => Promise<NewsletterResult>
}

export function NewsletterForm({ onSend }: NewsletterFormProps) {
  const [state, setState] = useState<FormState>('idle')
  const [subject, setSubject] = useState('')
  const [html, setHtml] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [sentCount, setSentCount] = useState(0)
  const [failedCount, setFailedCount] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')

  // Validation
  const subjectError =
    !subject.trim() ? 'Le sujet est requis' :
    subject.trim().length > 200 ? 'Maximum 200 caractères' : null

  const contentError =
    !html.trim() ? 'Le contenu est requis' :
    html.trim().length < 10 ? 'Minimum 10 caractères' :
    html.length > 50000 ? 'Maximum 50 000 caractères' : null

  const isValid = !subjectError && !contentError

  async function handleSubmit() {
    if (!isValid) return
    setState('sending')
    try {
      const result = await onSend(subject.trim(), html)
      setSentCount(result.sent)
      setFailedCount(result.failed)
      setState('success')
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Une erreur inattendue est survenue')
      setState('error')
    }
  }

  function handleReset() {
    setState('idle')
    setSubject('')
    setHtml('')
    setErrorMessage('')
    setSentCount(0)
    setFailedCount(0)
    setShowPreview(false)
  }

  // ── Envoi en cours ──────────────────────────────────────────────
  if (state === 'sending') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <div className="w-10 h-10 rounded-full border-2 border-[var(--accent)] border-t-transparent flex items-center justify-center animate-spin">
          <Loader2 size={18} className="text-[var(--accent)]" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-[var(--text-1)]">Envoi en cours...</p>
          <p className="text-xs text-[var(--text-3)] mt-1">Transmission de la newsletter aux utilisateurs</p>
        </div>
      </div>
    )
  }

  // ── Succès ──────────────────────────────────────────────────────
  if (state === 'success') {
    return (
      <div className="flex flex-col items-center gap-5 py-12">
        <div className="w-12 h-12 rounded-full bg-[var(--green)]/10 border border-[var(--green)]/20 flex items-center justify-center">
          <CheckCircle2 size={22} className="text-[var(--green)]" strokeWidth={1.5} />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-[var(--text-1)]">Newsletter envoyée</p>
          <p className="text-sm text-[var(--text-2)] mt-2">
            {sentCount > 0 ? (
              <>
                <span className="text-[var(--green)] font-medium">{sentCount.toLocaleString()}</span>
                {' utilisateur'}
                {sentCount > 1 ? 's' : ''}
                {failedCount > 0 && (
                  <span className="text-[var(--text-2)]">
                    {' '}reçu{sentCount > 1 ? 's' : ''}
                    {' · '}
                    <span className="text-[var(--red)] font-medium">{failedCount}</span>
                    {' échec'}
                    {failedCount > 1 ? 's' : ''}
                  </span>
                )}
              </>
            ) : (
              <span className="text-[var(--text-3)]">Aucun utilisateur à contacter</span>
            )}
          </p>
        </div>
        <button
          onClick={handleReset}
          className="h-9 px-5 flex items-center justify-center gap-2 rounded-lg
                     border border-[var(--border-md)] bg-white/[0.03] hover:bg-white/[0.06]
                     text-[var(--text-2)] text-sm font-medium transition-colors duration-150"
        >
          Nouvelle newsletter
        </button>
      </div>
    )
  }

  // ── Erreur ──────────────────────────────────────────────────────
  if (state === 'error') {
    return (
      <div className="flex flex-col gap-5 py-8">
        <div className="flex items-start gap-3 px-4 py-4 rounded-lg bg-[var(--red)]/[0.07] border border-[var(--red)]/20">
          <div className="w-5 h-5 rounded-full bg-[var(--red)]/15 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-[var(--red)] text-[11px] font-bold">!</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--red)]">Échec de l&apos;envoi</p>
            <p className="text-xs text-[var(--text-2)] mt-1 leading-relaxed">{errorMessage}</p>
          </div>
        </div>
        <button
          onClick={() => setState('idle')}
          className="h-9 px-5 flex items-center justify-center gap-2 rounded-lg
                     border border-[var(--border-md)] bg-white/[0.03] hover:bg-white/[0.06]
                     text-[var(--text-2)] text-sm font-medium transition-colors duration-150"
        >
          <RefreshCw size={13} strokeWidth={1.5} className="shrink-0" />
          Réessayer
        </button>
      </div>
    )
  }

  // ── Formulaire idle ─────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      {/* Champ sujet */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="subject" className="text-xs font-medium text-[var(--text-2)]">
            Objet de la newsletter
          </label>
          <span className={cn(
            'text-[11px] font-mono tabular-nums transition-colors duration-150',
            subject.length > 180 ? 'text-[var(--yellow)]' : 'text-[var(--text-3)]'
          )}>
            {subject.length}/200
          </span>
        </div>
        <input
          id="subject"
          type="text"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          maxLength={200}
          placeholder="Objet de la newsletter"
          className={cn(
            'h-9 px-3 rounded-md text-sm transition-colors duration-150',
            'bg-[var(--surface-1)] border text-[var(--text-1)] placeholder:text-[var(--text-3)]',
            'focus:outline-none',
            subjectError
              ? 'border-[var(--red)] focus:border-[var(--red)]'
              : 'border-[var(--border-md)] focus:border-[var(--accent)]/60 focus:ring-2 focus:ring-[var(--accent)]/15'
          )}
        />
        {subjectError && (
          <p className="text-[11px] text-[var(--red)] flex items-center gap-1 mt-0.5">
            <span className="w-1 h-1 rounded-full bg-[var(--red)] shrink-0" />
            {subjectError}
          </p>
        )}
      </div>

      {/* Champ contenu HTML */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="html-content" className="text-xs font-medium text-[var(--text-2)]">
            Contenu HTML
          </label>
          <button
            type="button"
            onClick={() => setShowPreview(p => !p)}
            className={cn(
              'h-6 px-2.5 flex items-center justify-center gap-1.5 rounded-md text-[11px] font-medium transition-colors duration-150',
              showPreview
                ? 'border border-[var(--accent)]/40 bg-[var(--accent)]/10 text-[var(--accent-hi)]'
                : 'border border-[var(--border-md)] text-[var(--text-3)] hover:text-[var(--text-2)] hover:bg-white/[0.04]'
            )}
          >
            {showPreview ? <EyeOff size={11} strokeWidth={1.5} /> : <Eye size={11} strokeWidth={1.5} />}
            {showPreview ? 'Masquer' : 'Aperçu'}
          </button>
        </div>

        {!showPreview ? (
          <>
            <textarea
              id="html-content"
              value={html}
              onChange={e => setHtml(e.target.value)}
              rows={14}
              placeholder="Contenu HTML compatible email (styles inline recommandés)"
              className={cn(
                'w-full px-3 py-2.5 rounded-md text-sm font-mono resize-none transition-colors duration-150',
                'bg-[var(--surface-1)] border text-[var(--text-1)] placeholder:text-[var(--text-3)]',
                'focus:outline-none',
                contentError
                  ? 'border-[var(--red)] focus:border-[var(--red)]'
                  : 'border-[var(--border-md)] focus:border-[var(--accent)]/60 focus:ring-2 focus:ring-[var(--accent)]/15'
              )}
            />
            <div className="flex items-center justify-between">
              {contentError ? (
                <p className="text-[11px] text-[var(--red)] flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-[var(--red)] shrink-0" />
                  {contentError}
                </p>
              ) : (
                <span />
              )}
              <span className={cn(
                'text-[11px] font-mono tabular-nums transition-colors duration-150',
                html.length > 45000 ? 'text-[var(--yellow)]' : 'text-[var(--text-3)]'
              )}>
                {html.length.toLocaleString()} / 50 000
              </span>
            </div>
          </>
        ) : (
          // Preview HTML — dangereux seulement si admin, contexte justifié
          <div className="relative rounded-md border border-[var(--border-md)] overflow-hidden">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-[var(--surface-2)] border-b border-[var(--border)]">
              <Eye size={11} className="text-[var(--text-3)]" strokeWidth={1.5} />
              <span className="text-[11px] text-[var(--text-3)]">Aperçu HTML</span>
            </div>
            <div
              className="p-4 bg-white text-sm overflow-auto max-h-80"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: html || '<p class="text-gray-400">Aucun contenu</p>' }}
            />
          </div>
        )}
      </div>

      {/* Info importante */}
      <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-lg bg-[var(--yellow)]/[0.06] border border-[var(--yellow)]/15">
        <div className="w-4 h-4 rounded-full bg-[var(--yellow)]/20 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-[var(--yellow)] text-[10px] font-bold">i</span>
        </div>
        <p className="text-xs text-[var(--text-2)] leading-relaxed">
          Les styles doivent être <strong>inline</strong> (ex&nbsp;: <code className="text-[var(--text-1)] font-mono text-[11px]">style=&quot;...&quot;</code>).
          Les clients email (Gmail, Apple Mail…) ne supportent pas les balises <code className="text-[var(--text-1)] font-mono text-[11px]">&lt;style&gt;</code> dans le body.
        </p>
      </div>

      {/* Bouton Envoyer */}
      <div className="flex items-center justify-end pt-1">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid}
          className={cn(
            'h-9 px-5 flex items-center justify-center gap-2 rounded-lg transition-colors duration-150',
            'text-sm font-medium',
            isValid
              ? 'bg-zinc-100 text-zinc-900 hover:bg-white shadow-sm'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
          )}
        >
          <Send size={13} strokeWidth={2} className="shrink-0" />
          Envoyer la newsletter
        </button>
      </div>
    </div>
  )
}
