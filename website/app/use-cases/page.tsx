import type { Metadata } from 'next'
import Link from 'next/link'
import CTABanner from '@/components/CTABanner'

export const metadata: Metadata = {
  title: 'Use Cases — CGVIP',
  description: 'How regulated enterprises use CGVIP to reduce approval cycles, cut compliance review, and industrialize creative production with full audit traceability.',
}

const problems = [
  { problem: 'Variant explosion', description: 'Scale of variants outstrips manual production capacity.' },
  { problem: 'Manual legal bottlenecks', description: 'File-by-file legal review slows time-to-market.' },
  { problem: 'Inconsistent disclaimer application', description: 'Risk of wrong or missing disclaimers per market.' },
  { problem: 'Poor test discipline', description: 'A/B tests not structured; performance data disconnected.' },
  { problem: 'Fragmented traceability', description: 'Hard to reconstruct which dataset/template/compliance set produced an asset.' },
  { problem: 'High cost per asset', description: 'Low reuse, repeated manual work.' },
  { problem: 'Low creative reuse', description: 'Templates underutilized; one-off builds dominate.' },
]

const beforeAfter = [
  { before: 'Legal reviews files.', after: 'Legal encodes rules.' },
  { before: 'Regions request edits.', after: 'Regions select controlled variants.' },
  { before: 'Designers manually adjust layouts.', after: 'Designers engineer templates.' },
  { before: 'Performance data disconnected from production.', after: 'AI orchestrates production; performance feeds back into dataset design.' },
]

const kpis = [
  '40% reduction in approval cycle time',
  '50% reduction in manual compliance review',
  '30% lower cost per asset',
  'Zero compliance violations in automated runs',
  '80% of campaign variants generated through the system',
  'Increased structured A/B test volume',
]

export default function UseCasesPage() {
  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
          Use cases
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-slate-600 dark:text-slate-400">
          Regulated enterprises use CGVIP to turn creative production into a governed, intelligent, measurable, and industrialized system—reducing regulatory exposure while increasing operational velocity.
        </p>

        {/* Problems */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Problems we address
          </h2>
          <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Problem
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {problems.map(({ problem, description }) => (
                  <tr key={problem} className="bg-white dark:bg-slate-800/30">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                      {problem}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                      {description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Before / After */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Cultural impact: before and after
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Creative becomes: Governed, Intelligent, Measurable, Industrialized.
          </p>
          <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Before
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">
                    After
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {beforeAfter.map(({ before, after }) => (
                  <tr key={before} className="bg-white dark:bg-slate-800/30">
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                      {before}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                      {after}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* KPIs */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            KPIs for success
          </h2>
          <ul className="mt-6 space-y-3">
            {kpis.map((kpi) => (
              <li
                key={kpi}
                className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50"
              >
                <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                <span className="text-slate-800 dark:text-slate-200">{kpi}</span>
              </li>
            ))}
          </ul>
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
        title="Ready to transform your creative operations?"
        description="Reduce approval cycles, cut compliance review, and scale variants with full governance."
        primaryHref="/contact"
        primaryLabel="Get in touch"
        secondaryHref="/product"
        secondaryLabel="See the product"
      />
    </>
  )
}
