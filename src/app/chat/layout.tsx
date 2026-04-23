import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const userSession = cookieStore.get('user_session')?.value
  const userPlan = cookieStore.get('user_plan')?.value

  // If no session, redirect to login with return URL
  if (!userSession) {
    redirect('/login?redirect=/chat')
  }

  // If no active subscription, redirect to pricing
  if (!userPlan || userPlan === 'free') {
    redirect('/pricing')
  }

  return <>{children}</>
}
