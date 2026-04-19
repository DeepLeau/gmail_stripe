'use client'

import { useState, useRef, useEffect } from 'react'
import { LogOut, Loader2, ChevronDown } from 'lucide-react'
import { logoutAction } from '@/app/actions/auth'
import { PlanBadge } from './PlanBadge'
import { cn } from '@/lib/utils'

type SubscriptionInfo = {
  plan: string
  quotaUsed: number
  quotaLimit: number
  status: string
}

type UserMenuProps = {
  userEmail: string
}

export function UserMenu({ userEmail }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [loadingSubscription, setLoadingSubscription] = useState(false)
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  // Initiales : 2 premières lettres de l'email, uppercase
  const initials = userEmail.slice(0, 2).toUpperCase()

  // Charger l'abonnement au premier open
  useEffect(() => {
    if (!open) return
    if (subscription) return // déjà chargé

    setLoadingSubscription(true)
    fetch('/api/subscription')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setSubscription(data)
      })
      .catch(() => {})
      .finally(() => setLoadingSubscription(false))
  }, [open, subscription])

  // Fermeture clic extérieur + Escape
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }

    if (open) {
      document.addEventListener('mousedown', handleClick)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await logoutAction()
    } catch {
      setLoggingOut(false)
    }
  }

  const messagesRemaining = subscription
    ? subscription.quotaLimit - subscription.quotaUsed
    : null

  return (
    <div ref={ref} className="relative">
      {/* Trigger : avatar rond */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Menu utilisateur"
        aria-expanded={open}
        className="w-8 h-8 rounded-full flex items-center justify-center
                   bg-[var(--accent-light)] text-[var(--accent-light-text)]
                   text-xs font-semibold shrink-0
                   hover:ring-2 hover:ring-[var(--accent)]/30 transition-all duration-150"
      >
        {initials}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 z-50
                     min-w-[240px] w-max
                     bg-[var(--surface-1)] border border-[var(--border-md)]
                     rounded-lg shadow-xl overflow-hidden py-1"
        >
          {/* Email */}
          <div
            className="px-3 py-2.5 border-b"
            style={{ borderColor: 'var(--border)' }}
          >
            <p
              className="text-xs mb-0.5"
              style={{ color: 'var(--text-3)' }}
            >
              Connecté en tant que
            </p>
            <p
              className="text-sm font-medium truncate"
              style={{ color: 'var(--text)' }}
            >
              {userEmail}
            </p>
          </div>

          {/* Plan + quota */}
          <div
            className="px-3 py-2.5 border-b"
            style={{ borderColor: 'var(--border)' }}
          >
            {loadingSubscription ? (
              <div className="flex items-center gap-2">
                <Loader2
                  size={12}
                  className="animate-spin"
                  style={{ color: 'var(--text-3)' }}
                />
                <span
                  className="text-xs"
                  style={{ color: 'var(--text-3)' }}
                >
                  Chargement...
                </span>
              </div>
            ) : subscription ? (
              <PlanBadge
                planName={subscription.plan}
                messagesRemaining={messagesRemaining ?? 0}
                quotaLimit={subscription.quotaLimit}
              />
            ) : (
              <span
                className="text-xs"
                style={{ color: 'var(--text-3)' }}
              >
                Aucun plan actif
              </span>
            )}
          </div>

          {/* Bouton déconnexion */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-2.5 px-3 h-9 text-sm
                       text-[var(--red)] hover:bg-[var(--red)]/8
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors duration-100 whitespace-nowrap"
          >
            {loggingOut ? (
              <>
                <Loader2 size={14} className="animate-spin shrink-0" />
                <span>Déconnexion...</span>
              </>
            ) : (
              <>
                <LogOut size={14} strokeWidth={1.5} className="shrink-0" />
                <span>Se déconnecter</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
