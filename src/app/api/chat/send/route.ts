import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Mock AI response (no LLM integration yet)
function generateMockResponse(): string {
  const responses = [
    "D'après vos emails, je pense que cette question concerne votre dernier échange avec le client. Souhaitez-vous que je vous propose une réponse ?",
    "J'ai trouvé plusieurs fils de discussion pertinents dans votre boîte mail. Voici ce que je peux vous proposer :",
    "En analysant vos emails récents, je vous suggère la réponse suivante :",
  ]
  return responses[Math.floor(Math.random() * responses.length)]
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body?.content) {
    return NextResponse.json({ error: 'content is required' }, { status: 400 })
  }

  // Call decrement_units RPC
  const { data: rpcResult, error: rpcError } = await supabase.rpc('decrement_units')

  // Handle RPC errors gracefully
  if (rpcError) {
    console.error('decrement_units RPC error:', rpcError)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }

  const result = rpcResult as { limit_reached?: boolean; remaining?: number }

  if (result?.limit_reached) {
    return NextResponse.json(
      { error: 'limit_reached', remaining: 0 },
      { status: 403 }
    )
  }

  // Return mock response
  return NextResponse.json({
    text: generateMockResponse(),
    units_used: 1,
  })
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
