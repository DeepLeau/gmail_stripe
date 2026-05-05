'use client'

import { useSearchParams } from 'next/navigation'
import { SignupForm } from '@/components/auth/SignupForm'

export function SignupPageClient() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id') ?? undefined

  return <SignupForm sessionId={sessionId} />
}
