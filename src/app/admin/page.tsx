export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NewsletterForm } from '@/components/admin/NewsletterForm'
import { Mail, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

export default async function AdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirection si non connecté
  if (!user) {
    redirect('/login')
  }

  // Redirection si non admin (fail-secure)
  const adminEmailsRaw = process.env.ADMIN_EMAILS ?? ''
  const adminEmails = adminEmailsRaw
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)

  const userEmail = user.email?.toLowerCase() ?? ''
  const isAdmin = adminEmails.length === 0
    ? false // fail-secure : si ADMIN_EMAILS non configuré, personne n'est admin
    : adminEmails.includes(userEmail)

  if (!isAdmin) {
    redirect('/')
  }

  // Fetch synchrone : page Server Component → Server Action impossible comme prop,
  // on passe une fonction qui fait un fetch vers l'API route.
  async function handleSend(subject: string, html: string) {
    'use server'
    // La fonction est capturée dans le Server Component, appelée côté client.
    // On fait un fetch direct vers la route API.
    const res = await fetch('/api/admin/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, html }),
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(error.error ?? `Erreur ${res.status}`)
    }

    return res.json() as Promise<{ sent: number; failed: number }>
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)]">
      {/* Sidebar gauche — visible sur desktop */}
      <aside className="w-[220px] shrink-0 h-screen flex flex-col bg-[var(--bg)] border-r border-[var(--border)] px-3 py-4">
        {/* Logo */}
        <div className="flex items-center gap-2 px-2 mb-6 shrink-0">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">E</span>
          </div>
          <span className="text-sm font-semibold text-[var(--text-1)] tracking-tight truncate">Emmind</span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-0.5 flex-1 overflow-y-auto">
          <p className="px-2 mb-1 text-[11px] font-medium text-[var(--text-3)] uppercase tracking-wider shrink-0">
            Admin
          </p>
          <a
            href="/admin"
            className="flex items-center gap-2.5 px-2 h-8 rounded-md text-sm transition-colors duration-150
                       bg-white/[0.07] text-[var(--text-1)] font-medium border-l-2 border-[var(--accent)] pl-[6px]"
          >
            <Mail size={15} strokeWidth={1.5} className="shrink-0" />
            <span className="truncate">Newsletter</span>
          </a>
        </nav>

        {/* User footer */}
        <div className="shrink-0 border-t border-[var(--border)] pt-3 mt-2">
          <div className="flex items-center gap-2.5 px-2 py-2">
            <div className="w-6 h-6 rounded-full bg-[var(--surface-3)] flex items-center justify-center text-[10px] text-[var(--text-2)] font-medium shrink-0">
              {user.email?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs text-[var(--text-2)] truncate">{user.email}</span>
              <span className="text-[11px] text-[var(--accent-hi)] flex items-center gap-1">
                <ShieldCheck size={10} strokeWidth={1.5} className="shrink-0" />
                Admin
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Zone principale */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header page */}
        <header className="shrink-0 flex items-center justify-between h-14 px-6 border-b border-[var(--border)] bg-[var(--bg)]">
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-[var(--text-1)] truncate">Administration — Newsletter</h1>
            <p className="text-xs text-[var(--text-3)] truncate mt-0.5">Envoyer une newsletter à tous les utilisateurs inscrits</p>
          </div>
        </header>

        {/* Contenu scrollable */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-8 max-w-2xl mx-auto">
            {/* Card principale */}
            <div className={cn(
              'bg-[var(--surface-1)] border border-[var(--border-md)] rounded-xl p-8',
            )}>
              {/* Header de la card */}
              <div className="flex items-start gap-4 mb-8 pb-6 border-b border-[var(--border)]">
                <div className="w-9 h-9 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center shrink-0">
                  <Mail size={16} className="text-[var(--accent-hi)]" strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-semibold text-[var(--text-1)]">Nouvelle newsletter</h2>
                  <p className="text-sm text-[var(--text-3)] mt-1 leading-relaxed">
                    Rédigez votre message et envoyez-le à l&apos;ensemble des utilisateurs actifs de la plateforme.
                  </p>
                </div>
              </div>

              {/* Formulaire */}
              <NewsletterForm onSend={handleSend} />
            </div>

            {/* Disclaimer bas de page */}
            <p className="text-xs text-[var(--text-3)] text-center mt-4 leading-relaxed">
              L&apos;envoi est limité par le quota Resend de votre plan. Les emails non livrables sont comptabilisés en échecs.
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
