'use client'

export function UpgradeBanner() {
  return (
    <div className="shrink-0 px-4 py-3 border-t border-[var(--border-md)] bg-[var(--surface)]">
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[var(--text)]">
            Limite de messages atteinte
          </p>
          <p className="text-xs text-[var(--text-2)] mt-0.5">
            Passez à Scale ou Team pour continuer à poser des questions.
          </p>
        </div>
        <a
          href="/pricing"
          className="h-8 px-4 flex items-center justify-center rounded-lg
                     bg-[var(--accent)] hover:bg-[var(--accent-hi)] text-white
                     text-xs font-medium transition-colors duration-150 whitespace-nowrap"
        >
          Voir les tarifs
        </a>
      </div>
    </div>
  )
}
