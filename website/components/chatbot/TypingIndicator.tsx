'use client'

export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-ink text-xs font-bold text-paper">
        C
      </div>
      <div className="rounded-ui bg-paper-subdued px-4 py-3">
        <div className="flex items-center gap-1" aria-label="Typing">
          <span className="chatbot-dot h-2 w-2 rounded-full bg-ink-faint" />
          <span className="chatbot-dot h-2 w-2 rounded-full bg-ink-faint [animation-delay:150ms]" />
          <span className="chatbot-dot h-2 w-2 rounded-full bg-ink-faint [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  )
}
