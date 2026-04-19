import Link from 'next/link'

type AuthCardProps = {
  title: string
  altLinkLabel: string
  altLinkHref: string
  children: React.ReactNode
}

export function AuthCard({ title, altLinkLabel, altLinkHref, children }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--surface)] relative overflow-hidden px-4">
      {/* Orb gradients — reprenant le hero de la landing */}
      <div className="orb orb--1" aria-hidden="true" />
      <div className="orb orb--2" aria-hidden="true" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white border border-[var(--border)] rounded-2xl p-8 shadow-sm">
          {/* Logo */}
          <div className="flex items-center justify-center mb-6">
            <span className="text-xl font-semibold text-[var(--accent)] tracking-tight">
              Emind
            </span>
          </div>

          {/* Titre */}
          <h1 className="text-xl font-semibold text-[var(--text)] text-center tracking-tight mb-6">
            {title}
          </h1>

          {/* Contenu (formulaire) */}
          {children}

          {/* Lien alternatif */}
          <p className="text-center text-sm text-[var(--text-2)] mt-6">
            <Link
              href={altLinkHref}
              className="text-[var(--accent)] hover:text-[var(--accent-hi)] font-medium transition-colors duration-150"
            >
              {altLinkLabel}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
