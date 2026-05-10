'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'
import { UserMenu } from '@/components/ui/UserMenu'
import type { SubscriptionData } from '@/lib/stripe/config'

interface NavLink {
  label: string
  href: string
}

interface NavbarMobileMenuProps {
  navLinks: NavLink[]
  userEmail?: string | null
  subscription?: SubscriptionData | null
}

export function NavbarMobileMenu({ navLinks, userEmail, subscription }: NavbarMobileMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      {/* Hamburger button */}
      <button
        className="md:hidden flex flex-col gap-1 p-2 rounded-md hover:bg-[var(--surface)] transition-colors"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Menu"
        aria-expanded={menuOpen}
      >
        <span
          className={cn(
            'block w-5 h-0.5 bg-[var(--text)] rounded transition-all duration-300',
            menuOpen && 'rotate-45 translate-y-[7px]'
          )}
        />
        <span
          className={cn(
            'block w-5 h-0.5 bg-[var(--text)] rounded transition-all duration-300',
            menuOpen && 'opacity-0'
          )}
        />
        <span
          className={cn(
            'block w-5 h-0.5 bg-[var(--text)] rounded transition-all duration-300',
            menuOpen && '-rotate-45 -translate-y-[7px]'
          )}
        />
      </button>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 border-t border-[var(--border)] bg-white/95 backdrop-blur-md py-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="px-4 py-3 text-sm text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface)] rounded-md transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 border-t border-[var(--border)] mt-2 px-4 flex flex-col gap-2">
            {userEmail ? (
              <UserMenu userEmail={userEmail} subscription={subscription} />
            ) : (
              <>
                <a
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-2.5 text-sm text-center text-[var(--text-2)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface)] transition-colors"
                >
                  Se connecter
                </a>
                <a
                  href="#pricing"
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-2.5 flex items-center justify-center gap-1.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hi)] text-white text-sm font-medium transition-colors"
                >
                  Commencer
                  <ArrowRight size={14} strokeWidth={2} />
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
