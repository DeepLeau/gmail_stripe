import { redirect } from 'next/navigation'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { createClient } from '@/lib/supabase/server'

export default async function ChatPage() {
  let supabase
  try {
    supabase = await createClient()
  } catch {
    // Env vars manquantes (build time ou configuration invalide)
    redirect('/login')
  }

  if (!supabase) {
    redirect('/login')
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch subscription data
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/api/subscription`, {
    cache: 'no-store',
  })

  let remaining: number | null = null
  let plan: string | null = null

  if (res.ok) {
    const data = await res.json()
    remaining = data.units_remaining
    plan = data.plan
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
          <ChatInterface remaining={remaining} plan={plan} />
        </div>
      </div>
    </main>
  )
}
