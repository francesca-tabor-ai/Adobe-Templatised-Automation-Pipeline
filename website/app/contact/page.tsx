import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Contact — CGVIP',
  description: 'Get in touch for enterprise inquiries about the Creative Governance & Variant Intelligence Platform.',
}

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
      <h1 className="text-4xl font-bold text-ink">
        Contact
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-ink-muted leading-relaxed">
        For enterprise inquiries about CGVIP—governed, AI-orchestrated creative automation for regulated brands—get in touch. We can discuss your pipeline, compliance requirements, and how to integrate with your Adobe and DAM stack.
      </p>

      <div className="mt-12 rounded-card border border-paper-border bg-paper-subdued p-8 shadow-soft">
        <h2 className="text-xl font-semibold text-ink">
          Get in touch
        </h2>
        <p className="mt-2 text-ink-muted leading-relaxed">
          Use the link below to send an email, or replace this section with a link to your CRM, Calendly, or contact form.
        </p>
        <div className="mt-6">
          <a
            href="mailto:enterprise@example.com?subject=CGVIP%20inquiry"
            className="inline-flex items-center justify-center rounded-ui bg-ink px-6 py-3.5 text-base font-semibold text-paper shadow-soft hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-muted"
          >
            Email us
          </a>
        </div>
        <p className="mt-4 text-sm text-ink-subtle leading-relaxed">
          Replace <code className="rounded bg-paper-border px-1.5 py-0.5 font-mono text-ink-muted">enterprise@example.com</code> with your contact address or link to an external form.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/product"
          className="text-ink-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-muted"
        >
          ← Product
        </Link>
        <Link
          href="/resources"
          className="text-ink-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-muted"
        >
          Resources →
        </Link>
      </div>
    </div>
  )
}
