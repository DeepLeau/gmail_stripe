export function FeatureStrip() {
  return (
    <div
      className="w-full border-y-2 py-4 overflow-hidden"
      style={{ borderColor: 'var(--border)', backgroundColor: '#ffffff' }}
    >
      <div
        className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-8 md:gap-16"
        style={{ opacity: 0.9 }}
      >
        <div className="flex items-center gap-3">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent-green)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span
            className="text-lg font-semibold uppercase tracking-wide"
            style={{
              fontFamily: 'var(--font-mono)',
              color: 'var(--neutral-text)',
            }}
          >
            Chat intelligent
          </span>
        </div>

        <div className="flex items-center gap-3">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent-secondary)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          <span
            className="text-lg font-semibold uppercase tracking-wide"
            style={{
              fontFamily: 'var(--font-mono)',
              color: 'var(--neutral-text)',
            }}
          >
            Réponses instantanées
          </span>
        </div>

        <div className="flex items-center gap-3">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent-primary)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span
            className="text-lg font-semibold uppercase tracking-wide"
            style={{
              fontFamily: 'var(--font-mono)',
              color: 'var(--neutral-text)',
            }}
          >
            Données sécurisées
          </span>
        </div>
      </div>
    </div>
  )
}
