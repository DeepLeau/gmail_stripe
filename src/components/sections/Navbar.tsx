'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, Menu } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Fonctionnalités', href: '#product' },
  { label: 'Comment ça marche', href: '#workflow' },
  { label: 'Tarifs', href: '#pricing' },
  { label: 'Témoignages', href: '#customers' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      id="navbar"
      className={`fixed top-0 w-full z-50 transition-all duration-300
        ${scrolled
          ? 'bg-surface/90 backdrop-blur-md border-b border-graphite-900/10'
          : 'bg-transparent border-b border-transparent'
        }`}
      style={{ padding: 'clamp(1rem, 2vw, 1.25rem) clamp(1.5rem, 5vw, 4rem)' }}
    >
      <div className="flex items-center justify-between max-w-[96rem] mx-auto">
        {/* Logo */}
        <a
          href="#"
          className="font-display font-semibold text-xl tracking-[0.04em] text-graphite-900 uppercase"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          MessageMind
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-mono text-xs font-medium uppercase tracking-[0.1em] text-graphite-900 hover:text-amber transition-colors relative group"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {link.label}
              <span className="absolute -bottom-1 left-1/2 w-0 h-[1px] bg-amber transition-all duration-200 group-hover:w-full group-hover:left-0 origin-center" />
            </a>
          ))}
        </div>

        {/* CTA */}
        <a
          href="#pricing"
          className="hidden md:inline-flex relative items-center justify-center px-6 py-3 font-mono text-xs font-semibold uppercase tracking-[0.1em] text-graphite-900 bg-gradient-to-b from-amber to-amberDark shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_10px_rgba(232,160,32,0.2)] group hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_6px_20px_rgba(232,160,32,0.4)] transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          <span className="relative z-10 flex items-center gap-2">
            Commencer
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
          </span>
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-swiss" />
        </a>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-graphite-900"
          aria-label="Menu"
        >
          <Menu size={24} strokeWidth={1.5} />
        </button>
      </div>
    </nav>
  )
}
