import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getUserServer } from '@/lib/auth/getUserServer'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const user = await getUserServer()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get: () => undefined,
        set: () => {},
        remove: () => {},
      },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  ) as any

  const { data, error } = await supabase.rpc('increment_message_count', {
    p_user_id: user.id,
  })

  if (error) {
    console.error('[increment] RPC error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // data contains { messages_used, messages_limit, is_limit_reached }
  return NextResponse.json(data)
}
