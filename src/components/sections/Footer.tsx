import { MessageSquare, Shield } from 'lucide-react'

const footerLinks = {
  Produit: [
    { label: 'Fonctionnalités', href: '#' },
    { label: 'Tarifs', href: '#pricing' },
    { label: 'Changelog', href: '#' },
  ],
  Légal: [
    { label: 'Confidentialité', href: '#' },
    { label: 'CGU', href: '#' },
    { label: 'Contact', href: '#' },
  ],
}

export function Footer() {
  return (
    <footer
      className="w-full py-12 border-t-2"
      style={{
        backgroundColor: '#ffffff',
        borderColor: '#2d3235',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start gap-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-8 h-8 flex items-center justify-center"
              style={{ backgroundColor: '#c24b46' }}
            >
              <MessageSquare size={16} className="text-white" strokeWidth={2} />
            </div>
            <span
              className="text-xl font-bold"
              style={{
                color: '#c24b46',
                fontFamily: 'var(--font-sans)',
                textShadow: '2px 2px 0 #2d3235',
              }}
            >
              Emind
            </span>
          </div>
          <p className="text-base mb-4" style={{ color: '#5a5f63' }}>
            L&apos;IA au service de vos conversations.
          </p>
          <div className="flex items-center gap-2 text-sm" style={{ color: '#5a5f63' }}>
            <Shield size={14} strokeWidth={2} />
            <span>Données chiffrées · Conforme RGPD</span>
          </div>
        </div>

        {/* Links */}
        <div className="flex gap-12">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="flex flex-col gap-3">
              <span
                className="text-base font-semibold"
                style={{
                  color: '#2d3235',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {category}
              </span>
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-base hover:underline decoration-2 underline-offset-4 transition-all"
                  style={{ color: '#5a5f63' }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div
        className="max-w-7xl mx-auto px-6 mt-10 pt-6 text-center text-sm"
        style={{
          borderTop: '1px solid rgba(45,50,53,0.15)',
          color: '#5a5f63',
        }}
      >
        © 2024 Emind Inc. Tous droits réservés.
      </div>
    </footer>
  )
}
