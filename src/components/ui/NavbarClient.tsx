'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { Menu, X, Loader2 } from 'lucide-react'
import { UserMenu } from './UserMenu'
import { logoutAction } from '@/app/actions/auth'

interface NavbarClientProps {
  userEmail: string | null
  userPlan: string | null
}

export function NavbarClient({ userEmail, userPlan }: NavbarClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  // Fermer le menu mobile au clic extérieur
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileOpen(false)
      }
    }
    if (mobileOpen) {
      document.addEventListener('mousedown', handleClick)
    }
    return () => {
      document.removeEventListener('mousedown', handleClick)
    }
  }, [mobileOpen])

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await logoutAction()
    } catch {
      setLoggingOut(false)
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border-md)]"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight shrink-0"
          style={{ color: 'var(--accent)' }}
        >
          Emind
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-6">
          <Link
            href="/#features"
            className="text-sm text-[var(--text-2)] hover:text-[var(--text)] transition-colors duration-150"
          >
            Fonctionnalités
          </Link>
          <Link
            href="/#pricing"
            className="text-sm text-[var(--text-2)] hover:text-[var(--text)] transition-colors duration-150"
          >
            Tarifs
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {userEmail ? (
            <UserMenu userEmail={userEmail} plan={userPlan} />
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="h-8 px-3 text-sm text-[var(--text-2)] hover:text-[var(--text)] transition-colors duration-150 flex items-center justify-center"
              >
                Se connecter
              </Link>
              <Link
                href="/signup"
                className="h-8 px-3 text-sm font-medium rounded-lg flex items-center justify-center transition-colors duration-150"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: '#fff',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--accent-hi)'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--accent)'
                }}
              >
                Commencer
              </Link>
            </div>
          )}

          {/* Mobile toggle */}
          <button
            className="sm:hidden w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-2)] hover:bg-[var(--surface)] transition-colors duration-150"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {mobileOpen ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          ref={mobileMenuRef}
          className="sm:hidden border-t border-[var(--border-md)] px-4 py-4 flex flex-col gap-4"
          style={{ backgroundColor: 'var(--bg)' }}
        >
          <Link
            href="/#features"
            className="text-sm text-[var(--text-2)] hover:text-[var(--text)] py-2"
            onClick={() => setMobileOpen(false)}
          >
            Fonctionnalités
          </Link>
          <Link
            href="/#pricing"
            className="text-sm text-[var(--text-2)] hover:text-[var(--text)] py-2"
            onClick={() => setMobileOpen(false)}
          >
            Tarifs
          </Link>
          {!userEmail && (
            <Link
              href="/login"
              className="text-sm text-[var(--text-2)] hover:text-[var(--text)] py-2"
              onClick={() => setMobileOpen(false)}
            >
              Se connecter
            </Link>
          )}
          {loggingOut && (
            <div className="flex items-center gap-2 text-sm text-[var(--text-2)]">
              <Loader2 size={14} className="animate-spin" />
              Déconnexion...
            </div>
          )}
        </div>
      )}
    </header>
  )
}
