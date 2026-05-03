import { ChatInterface } from '@/components/chat/ChatInterface'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()

  if (!authData?.user) {
    return (
      <main className="flex flex-col h-screen bg-white">
        <header className="shrink-0 flex items-center justify-center h-14 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-900 tracking-tight">
            Emind
          </span>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-500">Redirection vers la connexion...</p>
        </div>
      </main>
    )
  }

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
