'use client'

interface QuickActionsProps {
  actions: string[]
  onSelect: (action: string) => void
}

export default function QuickActions({ actions, onSelect }: QuickActionsProps) {
  return (
    <div className="flex flex-wrap gap-2 px-4 pb-2">
      {actions.map((action) => (
        <button
          key={action}
          onClick={() => onSelect(action)}
          className="rounded-pill border border-paper-border bg-paper px-3 py-1.5 text-xs font-medium text-ink-muted transition-colors duration-200 hover:bg-paper-subdued hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-muted"
        >
          {action}
        </button>
      ))}
    </div>
  )
}
