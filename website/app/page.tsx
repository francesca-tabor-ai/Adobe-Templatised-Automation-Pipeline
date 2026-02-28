import Link from 'next/link'
import CTABanner from '@/components/CTABanner'

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl lg:text-6xl">
            Governed, AI-orchestrated creative automation for regulated enterprises
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
            CGVIP is the AI Creative Operating System on top of Adobe. It does not replace InDesign, Photoshop, or After Effects—it orchestrates and governs them. Generate compliant multi-market variants, validate legal constraints, and maintain full audit traceability.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-md bg-slate-900 px-6 py-3 text-base font-semibold text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              Get in touch
            </Link>
            <Link
              href="/product"
              className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-900 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 dark:border-slate-600 dark:bg-transparent dark:text-slate-100 dark:hover:bg-slate-800"
            >
              See how it works
            </Link>
          </div>
        </div>
      </section>

      {/* Why CGVIP — problems and missing piece */}
      <section className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/30">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Why CGVIP?
          </h2>
          <p className="mt-4 max-w-3xl text-slate-600 dark:text-slate-400">
            Enterprise brands operating across markets face variant explosion, manual legal bottlenecks, inconsistent disclaimers, poor test discipline, and fragmented traceability. Current Adobe automation handles rendering—but intelligent orchestration, compliance reasoning, dataset governance, and performance feedback are missing. CGVIP adds that layer.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              'Variant explosion outstrips manual production capacity',
              'File-by-file legal review slows time-to-market',
              'Risk of wrong or missing disclaimers per market',
              'A/B tests not structured; performance data disconnected',
              'Hard to reconstruct which dataset produced an asset',
              'High cost per asset; low creative reuse',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Positioning pillars */}
      <section className="border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Not a design tool—an enterprise platform
          </h2>
          <p className="mt-4 max-w-3xl text-slate-600 dark:text-slate-400">
            CGVIP is a compliance defense infrastructure, a creative industrialization engine, a structured experimentation platform, and a global brand governance system. For regulated enterprises, it reduces regulatory exposure while increasing operational velocity.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: 'Compliance defense', desc: 'Encode and validate regulatory rules; reduce file-by-file legal review.' },
              { title: 'Creative industrialization', desc: 'Scale variants with governed templates and datasets.' },
              { title: 'Structured experimentation', desc: 'A/B tests with hypothesis tracking and performance feedback.' },
              { title: 'Global brand governance', desc: 'Market-level control, audit trail, and human-in-the-loop approval.' },
            ].map(({ title, desc }) => (
              <div
                key={title}
                className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800/50"
              >
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Human-in-the-loop */}
      <section className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/30">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            AI proposes. Humans authorize.
          </h2>
          <p className="mt-4 max-w-3xl text-slate-600 dark:text-slate-400">
            Every agent has a defined mandate and explainable reasoning trail. Campaign modeling is owned by Marketing Lead; compliance rules by Legal Architect; template design by Creative Systems Lead; final approval override by Compliance Officer.
          </p>
        </div>
      </section>

      <CTABanner
        title="Ready to govern creative at scale?"
        description="See how CGVIP can reduce approval cycles, cut compliance review, and put 80% of campaign variants through a single governed system."
        primaryHref="/contact"
        primaryLabel="Get in touch"
        secondaryHref="/product"
        secondaryLabel="Explore the product"
      />
    </>
  )
}
