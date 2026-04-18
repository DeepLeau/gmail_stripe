import { footerLinks } from '@/lib/data'
import { Shield } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-[var(--border)] bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <a
              href="#"
              className="text-lg font-semibold text-[var(--accent)] tracking-tight"
            >
              Emind
            </a>
            <p className="text-sm text-[var(--text-2)] max-w-xs leading-relaxed">
              Tes emails savent tout. Maintenant tu peux leur parler.
            </p>
            {/* Status indicator */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
              <span className="text-xs text-[var(--text-2)]">
                Tous les systèmes opérationnels
              </span>
            </div>
          </div>

          {/* Legal links */}
          <nav className="flex items-center gap-6 flex-wrap">
            {footerLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-[var(--text-2)] hover:text-[var(--text)] transition-colors duration-150"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-[var(--text-3)] font-mono">
            © {currentYear} Emind. Tous droits réservés.
          </p>
          <div className="flex items-center gap-1.5">
            <Shield size={12} className="text-[var(--accent)]" strokeWidth={1.5} />
            <span className="text-xs text-[var(--text-3)]">
              Chiffrement AES-256 · RGPD compliant
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
