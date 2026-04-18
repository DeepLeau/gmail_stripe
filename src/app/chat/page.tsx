import { ChatInterface } from '@/components/chat/ChatInterface'

// Force le rendu dynamique — empêche Next.js de pré-générer cette page au build.
// Nécessaire car ChatInterface dépend de Supabase (variables d'environnement client).
// En rendu statique, ces vars ne sont pas disponibles → crash.
export const dynamic = 'force-dynamic'

export default function ChatPage() {
  return (
    <main className="flex flex-col h-screen bg-white">
      {/* Header discret */}
      <header className="shrink-0 flex items-center justify-center h-14 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-900 tracking-tight">
          Emind
        </span>
      </header>

      {/* Zone de chat */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-3xl mx-auto h-full px-4">
          <ChatInterface />
        </div>
      </div>
    </main>
  )
}
