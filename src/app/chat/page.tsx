export const dynamic = 'force-dynamic'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { ChatInterface } from '@/components/chat/ChatInterface'

export default async function ChatPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  let remaining: number | null = null
  let planName: string | null = null

  if (user) {
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('plan, messages_limit, messages_used')
      .eq('user_id', user.id)
      .single()

    if (subscription) {
      const limit = subscription.messages_limit ?? 10
      const used = subscription.messages_used ?? 0
      remaining = limit - used
      planName = subscription.plan ?? null
    }
  }

  return (
    <main className="flex h-screen overflow-hidden">
      <div className="flex-1 overflow-hidden">
        <div className="max-w-3xl mx-auto h-full px-4">
          <ChatInterface remaining={remaining} planName={planName} />
        </div>
      </div>
    </main>
  )
}
