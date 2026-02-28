import Link from 'next/link'
import CTABanner from '@/components/CTABanner'

export default function HomePage() {
  return (
    <>
      {/* Hero — gradient accent strip, sentence-case headline, lots of whitespace */}
      <section className="relative mx-auto max-w-6xl px-4 pt-16 pb-24 sm:px-6 lg:pt-24 lg:pb-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="gradient-accent-strip mx-auto mb-10 w-24" aria-hidden />
          <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl lg:text-6xl">
            Governed, AI-orchestrated creative automation for regulated enterprises
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-ink-muted leading-relaxed">
            CGVIP is the AI Creative Operating System on top of Adobe. It does not replace InDesign, Photoshop, or After Effects—it orchestrates and governs them. Generate compliant multi-market variants, validate legal constraints, and maintain full audit traceability.
          </p>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-ui bg-ink px-6 py-3.5 text-base font-semibold text-paper shadow-soft hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-muted"
            >
              Get in touch
            </Link>
            <Link
              href="/product"
              className="inline-flex items-center justify-center rounded-ui border border-paper-border bg-paper px-6 py-3.5 text-base font-semibold text-ink hover:bg-paper-subdued focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-muted"
            >
              See how it works
            </Link>
          </div>
        </div>
      </section>

      {/* Why CGVIP — cool grey section, generous line height */}
      <section className="border-t border-paper-border bg-paper-subdued">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
          <h2 className="text-3xl font-bold text-ink">
            Why CGVIP?
          </h2>
          <p className="mt-5 max-w-3xl text-ink-muted leading-relaxed">
            Enterprise brands operating across markets face variant explosion, manual legal bottlenecks, inconsistent disclaimers, poor test discipline, and fragmented traceability. Current Adobe automation handles rendering—but intelligent orchestration, compliance reasoning, dataset governance, and performance feedback are missing. CGVIP adds that layer.
          </p>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              'Variant explosion outstrips manual production capacity',
              'File-by-file legal review slows time-to-market',
              'Risk of wrong or missing disclaimers per market',
              'A/B tests not structured; performance data disconnected',
              'Hard to reconstruct which dataset produced an asset',
              'High cost per asset; low creative reuse',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-ink-muted leading-relaxed">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-subtle" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Positioning pillars — rounded cards, soft shadow */}
      <section className="border-t border-paper-border bg-paper">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
          <h2 className="text-3xl font-bold text-ink">
            Not a design tool—an enterprise platform
          </h2>
          <p className="mt-5 max-w-3xl text-ink-muted leading-relaxed">
            CGVIP is a compliance defense infrastructure, a creative industrialization engine, a structured experimentation platform, and a global brand governance system. For regulated enterprises, it reduces regulatory exposure while increasing operational velocity.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: 'Compliance defense', desc: 'Encode and validate regulatory rules; reduce file-by-file legal review.' },
              { title: 'Creative industrialization', desc: 'Scale variants with governed templates and datasets.' },
              { title: 'Structured experimentation', desc: 'A/B tests with hypothesis tracking and performance feedback.' },
              { title: 'Global brand governance', desc: 'Market-level control, audit trail, and human-in-the-loop approval.' },
            ].map(({ title, desc }) => (
              <div
                key={title}
                className="rounded-card border border-paper-border bg-paper p-6 shadow-soft"
              >
                <h3 className="font-semibold text-ink">{title}</h3>
                <p className="mt-2 text-sm text-ink-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Human-in-the-loop */}
      <section className="border-t border-paper-border bg-paper-subdued">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
          <h2 className="text-3xl font-bold text-ink">
            AI proposes. Humans authorize.
          </h2>
          <p className="mt-5 max-w-3xl text-ink-muted leading-relaxed">
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
