'use client'

interface ChatButtonProps {
  isOpen: boolean
  onClick: () => void
}

export default function ChatButton({ isOpen, onClick }: ChatButtonProps) {
  return (
    <button
      onClick={onClick}
      className="group fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-pill bg-ink shadow-soft-lg transition-all duration-200 hover:scale-105 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-muted"
      aria-label={isOpen ? 'Close chat' : 'Open chat assistant'}
      aria-expanded={isOpen}
    >
      {/* Chat icon */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        className={`absolute text-paper transition-all duration-200 ${isOpen ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}
        aria-hidden
      >
        <path
          d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Close icon */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        className={`absolute text-paper transition-all duration-200 ${isOpen ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`}
        aria-hidden
      >
        <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {/* Gradient ring on hover */}
      <span className="absolute inset-0 rounded-pill bg-accent-gradient opacity-0 transition-opacity duration-200 group-hover:opacity-20" />
    </button>
  )
}
