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
            ? 'bg-blue-50 text-blue-800 rounded-br-md'
            : 'bg-white border border-gray-200 text-gray-900 shadow-sm rounded-bl-md'
        }`}
      >
        {message.content}
      </div>
    </div>
  )
}
