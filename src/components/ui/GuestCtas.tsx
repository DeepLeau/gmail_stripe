'use client'

import { ArrowRight } from 'lucide-react'

export function GuestCtas() {
  return (
    <>
      <a
        href="/login"
        className="h-8 px-3 flex items-center justify-center text-sm text-[var(--text-2)] hover:text-[var(--text)] transition-colors duration-150 rounded-md border border-transparent hover:border-[var(--border)]"
      >
        Se connecter
      </a>
      <a
        href="/signup"
        className="h-9 px-4 flex items-center justify-center rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hi)] text-white text-sm font-medium transition-colors duration-150 shadow-sm gap-1.5"
      >
        Commencer
        <ArrowRight size={14} strokeWidth={2} />
      </a>
    </>
  )
}
