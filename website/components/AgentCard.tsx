type AgentCardProps = {
  name: string
  role: string
  impact: string
  index: number
}

export default function AgentCard({ name, role, impact, index }: AgentCardProps) {
  return (
    <article className="rounded-card border border-paper-border bg-paper p-6 shadow-soft">
      <div className="flex items-start gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-paper-subdued text-sm font-semibold text-ink-muted tabular-nums">
          {index}
        </span>
        <div className="min-w-0">
          <h3 className="font-semibold text-ink">{name}</h3>
          <p className="mt-1 text-sm text-ink-muted leading-relaxed">{role}</p>
          <p className="mt-2 text-sm font-medium text-ink">
            Impact: <span className="font-normal text-ink-muted">{impact}</span>
          </p>
        </div>
      </div>
    </article>
  )
}
