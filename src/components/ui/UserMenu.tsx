'use client'

import { useState, useRef, useEffect } from 'react'
import { LogOut, Loader2, Zap } from 'lucide-react'
import { logoutAction } from '@/app/actions/auth'

type UserMenuProps = {
  userEmail: string
}

type BillingInfo = {
  plan: string
  messages_used: number
  messages_limit: number
  subscription_status: string
}

const PLAN_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  start: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.2)' },
  scale: { bg: 'rgba(139, 92, 246, 0.1)', text: '#8b5cf6', border: 'rgba(139, 92, 246, 0.2)' },
  team: { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.2)' },
  free: { bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280', border: 'rgba(107, 114, 128, 0.2)' },
}

const PLAN_LABELS: Record<string, string> = {
  start: 'Start',
  scale: 'Scale',
  team: 'Team',
  free: 'Free',
}

function getPlanColors(plan: string) {
  return PLAN_COLORS[plan.toLowerCase()] ?? PLAN_COLORS.free
}

function formatMessagesRemaining(used: number, limit: number): string {
  const remaining = limit - used
  if (remaining <= 0) return '0 restant'
  if (remaining === 1) return '1 restant'
  return `${remaining} restants`
}

export function UserMenu({ userEmail }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [billing, setBilling] = useState<BillingInfo | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  // Initiales : 2 premières lettres de l'email, uppercase
  const initials = userEmail.slice(0, 2).toUpperCase()

  // Fetch billing info silently on mount
  useEffect(() => {
    async function fetchBilling() {
      try {
        const res = await fetch('/api/billing')
        if (res.ok) {
          const data: BillingInfo = await res.json()
          setBilling(data)
        }
      } catch {
        // Silently ignore — no billing info shown
      }
    }
    fetchBilling()
  }, [])

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

  const planColors = billing ? getPlanColors(billing.plan) : null
  const planLabel = billing ? PLAN_LABELS[billing.plan.toLowerCase()] ?? billing.plan : null
  const messagesText = billing
    ? formatMessagesRemaining(billing.messages_used, billing.messages_limit)
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
        <div className="absolute right-0 top-full mt-2 z-50
                        min-w-[220px] w-max
                        bg-white border border-[var(--border-md)]
                        rounded-lg shadow-xl overflow-hidden py-1">
          {/* Email */}
          <div className="px-3 py-2.5 border-b border-[var(--border)]">
            <p className="text-xs" style={{ color: 'var(--text-3)', marginBottom: '2px' }}>
              Connecté en tant que
            </p>
            <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
              {userEmail}
            </p>
          </div>

          {/* Plan + quota (only if billing loaded successfully) */}
          {planColors && planLabel && messagesText && (
            <div className="px-3 py-2.5 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Zap size={12} strokeWidth={2} style={{ color: planColors.text }} />
                <span
                  className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold"
                  style={{
                    backgroundColor: planColors.bg,
                    color: planColors.text,
                    border: `1px solid ${planColors.border}`,
                  }}
                >
                  {planLabel}
                </span>
              </div>
              <span className="text-[11px]" style={{ color: 'var(--text-2)' }}>
                {messagesText}
              </span>
            </div>
          )}

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
