import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const content = body?.content as string | undefined

  if (!content?.trim()) {
    return NextResponse.json({ error: 'content_required' }, { status: 400 })
  }

  // Retrieve l'utilisateur connecté
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: () => request.cookies.get('sb-session')?.value,
        set: () => {},
        remove: () => {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  // Vérification du quota — appel à la RPC côté Supabase
  const { data: quotaData } = await supabase.rpc('check_and_consume_quota', {
    p_user_id: user.id,
  })

  const blocked = !quotaData?.allowed
  if (blocked) {
    return NextResponse.json(
      { text: '', remaining: 0, blocked: true },
      { status: 403 }
    )
  }

  // Logique IA à implémenter (placeholder)
  const aiText = `Tu as dit : "${content}". Réponse de l'IA à implémenter.`

  return NextResponse.json({
    text: aiText,
    remaining: quotaData?.remaining ?? null,
  })
}
