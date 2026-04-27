'use client'

import { useState, useRef, useEffect } from 'react'
import { LogOut, Loader2, CreditCard } from 'lucide-react'
import { logoutAction } from '@/app/actions/auth'

type UserMenuProps = {
  userEmail: string
}

export function UserMenu({ userEmail }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Initiales : 2 premières lettres de l'email, uppercase
  const initials = userEmail.slice(0, 2).toUpperCase()

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
            <p className="text-xs text-[var(--text-3)] mb-0.5">Connecté en tant que</p>
            <p className="text-sm text-[var(--text)] font-medium truncate">{userEmail}</p>
          </div>

          {/* Lien Abonnement */}
          <a
            href="/settings/billing"
            className="w-full flex items-center gap-2.5 px-3 h-9 text-sm
                       text-[var(--text)] hover:bg-[var(--bg)]
                       transition-colors duration-100 whitespace-nowrap"
          >
            <CreditCard size={14} strokeWidth={1.5} className="shrink-0" />
            <span>Abonnement</span>
          </a>

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
