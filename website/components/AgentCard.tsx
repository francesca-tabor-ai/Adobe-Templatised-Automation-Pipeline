type AgentCardProps = {
  name: string
  role: string
  impact: string
  index: number
}

export default function AgentCard({ name, role, impact, index }: AgentCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800/50">
      <div className="flex items-start gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
          {index}
        </span>
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">{name}</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{role}</p>
          <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            Impact: {impact}
          </p>
        </div>
      </div>
    </article>
  )
}
