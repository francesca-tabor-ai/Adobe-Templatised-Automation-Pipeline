'use client'

import { useRef, useEffect } from 'react'
import { Message } from '@/lib/chatbot/types'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import QuickActions from './QuickActions'
import TypingIndicator from './TypingIndicator'

interface ChatWindowProps {
  messages: Message[]
  isTyping: boolean
  onSend: (text: string) => void
  onQuickAction: (action: string) => void
  onClose: () => void
  lastBotLink?: { label: string; href: string }
  lastBotQuickActions?: string[]
}

export default function ChatWindow({
  messages,
  isTyping,
  onSend,
  onQuickAction,
  onClose,
  lastBotLink,
  lastBotQuickActions,
}: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  return (
    <div
      className="chatbot-window fixed bottom-24 right-6 z-50 flex w-[360px] flex-col overflow-hidden rounded-card bg-paper shadow-soft-lg sm:w-96 max-sm:bottom-0 max-sm:right-0 max-sm:left-0 max-sm:top-0 max-sm:w-full max-sm:rounded-none"
      role="dialog"
      aria-label="CGVIP Chat Assistant"
    >
      {/* Header */}
      <div className="relative">
        <div className="gradient-accent-strip w-full" />
        <div className="flex items-center justify-between bg-ink px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-pill bg-paper text-xs font-bold text-ink">
              C
            </div>
            <div>
              <h2 className="text-sm font-semibold text-paper">CGVIP Assistant</h2>
              <p className="text-xs text-paper/60">Ask me anything about the platform</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-ui text-paper/70 transition-colors hover:bg-paper/10 hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper/40"
            aria-label="Close chat"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-4" style={{ maxHeight: '380px' }}>
        {messages.map((msg, i) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            link={msg.role === 'bot' && i === messages.length - 1 ? lastBotLink : undefined}
          />
        ))}
        {isTyping && <TypingIndicator />}
      </div>

      {/* Quick actions — shown after the last bot message */}
      {!isTyping && lastBotQuickActions && lastBotQuickActions.length > 0 && (
        <QuickActions actions={lastBotQuickActions} onSelect={onQuickAction} />
      )}

      {/* Input */}
      <ChatInput onSend={onSend} disabled={isTyping} />
    </div>
  )
}
