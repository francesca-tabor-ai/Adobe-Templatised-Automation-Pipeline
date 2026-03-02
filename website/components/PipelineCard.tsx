type PipelineCardProps = {
  app: string
  icon: React.ReactNode
  description: string
  dataSource: string
  output: string
  capabilities: string[]
  templateReqs: string[]
}

export default function PipelineCard({
  app,
  icon,
  description,
  dataSource,
  output,
  capabilities,
  templateReqs,
}: PipelineCardProps) {
  return (
    <article className="rounded-card border border-paper-border bg-paper p-6 shadow-soft sm:p-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-ui bg-paper-subdued text-ink-muted">
          {icon}
        </span>
        <div className="min-w-0">
          <h3 className="text-xl font-bold text-ink">{app}</h3>
          <p className="mt-1 text-sm text-ink-muted leading-relaxed">{description}</p>
        </div>
      </div>

      {/* Two-column detail */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">
            Capabilities
          </h4>
          <ul className="mt-3 space-y-2">
            {capabilities.map((cap) => (
              <li key={cap} className="flex items-start gap-2 text-sm text-ink-muted leading-relaxed">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" aria-hidden />
                {cap}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">
            Template requirements
          </h4>
          <ul className="mt-3 space-y-2">
            {templateReqs.map((req) => (
              <li key={req} className="flex items-start gap-2 text-sm text-ink-muted leading-relaxed">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" aria-hidden />
                {req}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer badges */}
      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-paper-border pt-5">
        <span className="inline-flex items-center gap-1.5 rounded-pill border border-paper-border bg-paper-subdued px-3 py-1 text-xs font-medium text-ink-muted">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M2 3h8M2 6h8M2 9h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Input: {dataSource}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-pill border border-paper-border bg-paper-subdued px-3 py-1 text-xs font-medium text-ink-muted">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M6 2v8M3 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Output: {output}
        </span>
      </div>
    </article>
  )
}
