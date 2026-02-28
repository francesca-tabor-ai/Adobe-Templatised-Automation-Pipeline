import type { Metadata } from 'next'
import Link from 'next/link'
import AgentCard from '@/components/AgentCard'
import CTABanner from '@/components/CTABanner'

export const metadata: Metadata = {
  title: 'Product — CGVIP',
  description: 'Seven specialized agents orchestrate Adobe creative pipelines: campaign architect, compliance, dataset governance, template compatibility, render orchestration, QA & risk, performance intelligence.',
}

const agents = [
  {
    name: 'Campaign Architect Agent',
    role: 'Translates campaign briefs into structured variant models. Uses approved claim libraries only.',
    impact: 'Variation schema, hypothesis structure, required fields per market, template compatibility validation.',
  },
  {
    name: 'Compliance Intelligence Agent',
    role: 'Encodes and validates regulatory rules: market-claim validation, disclaimer matching, expiry rules, health warnings.',
    impact: 'Reduces file-by-file legal review; compliance approval flags and audit trail.',
  },
  {
    name: 'Dataset Governance Agent',
    role: 'Maintains structured dataset integrity: missing fields, conflicting claims, version-lock, naming conventions.',
    impact: 'Protects deterministic output and template-version compatibility.',
  },
  {
    name: 'Creative Template Compatibility Agent',
    role: 'Ensures dataset works with Adobe templates: character limits, overset prediction (InDesign), safe-zone and motion timing (After Effects).',
    impact: 'Prevents broken renders before they happen.',
  },
  {
    name: 'Render Orchestration Agent',
    role: 'Triggers Adobe production workflows: InDesign merge, Photoshop batch, After Effects render queue; job status and retries.',
    impact: 'Outputs pushed to DAM with structured metadata.',
  },
  {
    name: 'QA & Risk Agent',
    role: 'Post-render validation: disclaimer presence, safe area, missing assets, brand layer integrity, version alignment.',
    impact: 'Flags exceptions before publication.',
  },
  {
    name: 'Performance Intelligence Agent',
    role: 'Closes the loop: ingests channel performance and variant metadata; insights, next-test suggestions, fatigue alerts.',
    impact: 'Turns creative production into a learning system.',
  },
]

const flowSteps = [
  'User Input',
  'Campaign Architect Agent',
  'Dataset Governance Agent',
  'Compliance Intelligence Agent',
  'Template Compatibility Agent',
  'Render Orchestration Agent',
  'QA & Risk Agent',
  'DAM Archive',
  'Performance Intelligence Agent',
  'Optimization Feedback Loop',
]

export default function ProductPage() {
  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
          Product
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-slate-600 dark:text-slate-400">
          CGVIP sits between marketing teams, legal & compliance, and Adobe creative templates—orchestrating and governing production. It does not replace Adobe; it orchestrates and governs it. Enterprise DAM and performance analytics integrate into the loop.
        </p>

        {/* System flow */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            System flow
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Every step generates: timestamp, version ID, agent reasoning log, approval state.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            {flowSteps.map((step, i) => (
              <div key={step} className="flex items-center gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-slate-300 bg-slate-50 text-sm font-medium text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {i + 1}
                </div>
                <span className="text-slate-800 dark:text-slate-200">{step}</span>
                {i < flowSteps.length - 1 && (
                  <span className="text-slate-400 dark:text-slate-500" aria-hidden>
                    ↓
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Seven agents */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Multi-agent architecture
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Each agent has a defined mandate, authority boundary, and explainable reasoning trail. No single monolithic AI.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent, index) => (
              <AgentCard
                key={agent.name}
                name={agent.name}
                role={agent.role}
                impact={agent.impact}
                index={index + 1}
              />
            ))}
          </div>
        </section>

        <div className="mt-14">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-md bg-slate-900 px-6 py-3 text-base font-semibold text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            Get in touch
          </Link>
        </div>
      </div>

      <CTABanner
        title="See how CGVIP can orchestrate your creative pipeline"
        primaryHref="/contact"
        primaryLabel="Get in touch"
        secondaryHref="/use-cases"
        secondaryLabel="Use cases"
      />
    </>
  )
}
