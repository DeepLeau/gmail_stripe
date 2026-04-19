import type { ChatMessage } from '@/lib/chat/types'

interface ChatMessageBubbleProps {
  message: ChatMessage
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-[var(--accent-light)] text-[var(--accent-light-text)] rounded-br-md'
            : 'bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] shadow-sm rounded-bl-md'
        }`}
      >
        {message.content}
      </div>
    </div>
  )
}
