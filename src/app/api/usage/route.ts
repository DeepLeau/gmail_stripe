import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
        },
      },
    }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const count: number = typeof body.count === 'number' ? body.count : 1

    const now = new Date()
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    const { data: existing, error: fetchError } = await supabase
      .from('monthly_usage')
      .select('messages_used')
      .eq('user_id', user.id)
      .eq('month', month)
      .maybeSingle()

    if (fetchError) {
      console.error('[Usage API] Error fetching usage:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch usage' }, { status: 500 })
    }

    const newCount = (existing?.messages_used ?? 0) + count

    const { error: upsertError } = await supabase
      .from('monthly_usage')
      .upsert({
        user_id: user.id,
        month,
        messages_used: newCount,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,month',
      })

    if (upsertError) {
      console.error('[Usage API] Error upserting usage:', upsertError)
      return NextResponse.json({ error: 'Failed to update usage' }, { status: 500 })
    }

    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('messages_limit, plan_name')
      .eq('user_id', user.id)
      .maybeSingle()

    const limit = subscription?.messages_limit ?? 10

    return NextResponse.json({
      used: newCount,
      limit,
      plan: subscription?.plan_name ?? 'free',
    })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
