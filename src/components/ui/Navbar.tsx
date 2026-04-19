'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Menu, X, ArrowRight } from 'lucide-react'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { label: 'Fonctionnalités', href: '#features' },
    { label: 'Tarifs', href: '#pricing' },
    { label: 'Sécurité', href: '#trust' },
  ]

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-150',
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-[var(--border)] shadow-sm'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-14 gap-10">
          {/* Logo */}
          <a
            href="#"
            className="flex items-center gap-2 font-semibold text-[var(--accent)] text-lg tracking-tight flex-shrink-0"
          >
            Emind
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-3 h-8 flex items-center justify-center text-sm text-[var(--text-2)] hover:text-[var(--text)] rounded-md hover:bg-[var(--surface)] transition-colors duration-150"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA buttons */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            <a
              href="#"
              className="h-8 px-3 flex items-center justify-center text-sm text-[var(--text-2)] hover:text-[var(--text)] transition-colors duration-150 rounded-md border border-transparent hover:border-[var(--border)]"
            >
              Se connecter
            </a>
            <a
              href="#pricing"
              className="h-9 px-4 flex items-center justify-center rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hi)] text-white text-sm font-medium transition-colors duration-150 shadow-sm gap-1.5"
            >
              Commencer
              <ArrowRight size={14} strokeWidth={2} />
            </a>
          </div>

          {/* Mobile hamburger */}
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
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-[var(--border)] py-4 flex flex-col gap-1">
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
            <div className="pt-3 border-t border-[var(--border)] mt-2 flex flex-col gap-2">
              <a
                href="#"
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
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
