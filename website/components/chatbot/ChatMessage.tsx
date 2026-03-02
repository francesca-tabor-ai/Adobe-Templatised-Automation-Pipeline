'use client'

import Link from 'next/link'
import { Message } from '@/lib/chatbot/types'

interface ChatMessageProps {
  message: Message
  link?: { label: string; href: string }
}

export default function ChatMessage({ message, link }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex items-start gap-3 px-4 py-2 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-ink text-xs font-bold text-paper">
          C
        </div>
      )}

      {/* Bubble */}
      <div
        className={`max-w-[80%] rounded-ui px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-ink text-paper'
            : 'bg-paper-subdued text-ink'
        }`}
      >
        {message.text.split('\n').map((line, i) => (
          <span key={i}>
            {line}
            {i < message.text.split('\n').length - 1 && <br />}
          </span>
        ))}
        {link && !isUser && (
          <Link
            href={link.href}
            className="mt-2 inline-block text-xs font-semibold text-ink-muted underline hover:text-ink"
          >
            {link.label} &rarr;
          </Link>
        )}
      </div>
    </div>
  )
}
