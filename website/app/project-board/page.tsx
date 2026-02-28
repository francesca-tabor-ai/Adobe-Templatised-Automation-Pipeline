'use client'

import {
  projectBoardPhases,
  statusLabels,
  statusStyles,
  type BoardCard,
  type CardStatus,
} from '@/lib/projectBoardData'

function Card({ card }: { card: BoardCard }) {
  const statusClass = statusStyles[card.status]
  return (
    <article
      className="rounded-card border border-paper-border bg-paper p-4 shadow-soft transition-shadow hover:shadow-soft-lg"
      data-status={card.status}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-ink">{card.title}</h3>
        <span
          className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${statusClass}`}
          aria-label={`Status: ${statusLabels[card.status]}`}
        >
          {statusLabels[card.status]}
        </span>
      </div>
      {card.description && (
        <p className="mt-2 text-sm text-ink-muted leading-relaxed">{card.description}</p>
      )}
      {card.owner && (
        <p className="mt-3 text-xs text-ink-subtle">
          Owner: <span className="font-medium text-ink-muted">{card.owner}</span>
        </p>
      )}
    </article>
  )
}

function PhaseColumn({
  phase,
}: {
  phase: (typeof projectBoardPhases)[number]
}) {
  return (
    <section
      className="flex min-w-[280px] max-w-[320px] flex-shrink-0 flex-col rounded-card border border-paper-border bg-paper-subdued"
      aria-labelledby={`phase-title-${phase.id}`}
    >
      <header className="border-b border-paper-border p-4">
        <h2 id={`phase-title-${phase.id}`} className="text-lg font-bold text-ink">
          {phase.title}
        </h2>
        <p className="mt-0.5 text-sm font-medium text-ink-muted">{phase.subtitle}</p>
        <p className="mt-1 text-xs text-ink-subtle">{phase.duration}</p>
      </header>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        {phase.cards.map((card) => (
          <Card key={card.id} card={card} />
        ))}
      </div>
    </section>
  )
}

export default function ProjectBoardPage() {
  return (
    <>
      <div className="border-b border-paper-border bg-paper">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="gradient-accent-strip mb-6 w-24" aria-hidden />
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Project board
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-muted leading-relaxed">
            Enterprise Creative Production Modernization Program — 12-month deployment. Phases, deliverables, and owners. Governance-first; automation-second.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <span className="rounded-md border border-paper-border bg-paper px-2.5 py-1 text-ink-muted">
              ~9–12 months
            </span>
            <span className="rounded-md border border-paper-border bg-paper px-2.5 py-1 text-ink-muted">
              7 phases
            </span>
            <span className="rounded-md border border-paper-border bg-paper px-2.5 py-1 text-ink-muted">
              Regulated / multi-market
            </span>
          </div>
        </div>
      </div>

      <div className="bg-paper-subdued py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex gap-6 overflow-x-auto pb-4 pt-2 md:overflow-x-visible md:flex-wrap md:pb-0">
            {projectBoardPhases.map((phase) => (
              <PhaseColumn key={phase.id} phase={phase} />
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-paper-border bg-paper py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-xl font-bold text-ink">Status legend</h2>
          <ul className="mt-4 flex flex-wrap gap-4 text-sm">
            {(Object.entries(statusLabels) as [CardStatus, string][]).map(([status, label]) => (
              <li key={status} className="flex items-center gap-2">
                <span
                  className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${statusStyles[status]}`}
                >
                  {label}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-ink-muted">
            Data source: <code className="rounded bg-paper-subdued px-1.5 py-0.5 text-ink-muted">website/lib/projectBoardData.ts</code>. Update status and owners there or connect to a backend.
          </p>
        </div>
      </div>
    </>
  )
}
