import { ChatPageContent } from '@/components/chat/ChatPageContent'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function ChatPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const userEmail = user?.email ?? ''
  const userId = user?.id ?? null

  // Fetch user subscription status
  let subscription = null
  let usage = null

  if (userId) {
    const { data: subData } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    subscription = subData

    const { data: usageData } = await supabase
      .from('usage')
      .select('*')
      .eq('user_id', userId)
      .single()

    usage = usageData
  }

  return (
    <ChatPageContent
      userEmail={userEmail}
      subscription={subscription}
      usage={usage}
    />
  )
}
