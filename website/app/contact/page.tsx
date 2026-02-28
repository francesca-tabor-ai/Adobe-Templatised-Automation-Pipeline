import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Contact — CGVIP',
  description: 'Get in touch for enterprise inquiries about the Creative Governance & Variant Intelligence Platform.',
}

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
        Contact
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
        For enterprise inquiries about CGVIP—governed, AI-orchestrated creative automation for regulated brands—get in touch. We can discuss your pipeline, compliance requirements, and how to integrate with your Adobe and DAM stack.
      </p>

      <div className="mt-10 rounded-lg border border-slate-200 bg-slate-50 p-8 dark:border-slate-700 dark:bg-slate-900/30">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Get in touch
        </h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Use the link below to send an email, or replace this section with a link to your CRM, Calendly, or contact form.
        </p>
        <div className="mt-6">
          <a
            href="mailto:enterprise@example.com?subject=CGVIP%20inquiry"
            className="inline-flex items-center justify-center rounded-md bg-slate-900 px-6 py-3 text-base font-semibold text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            Email us
          </a>
        </div>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          Replace <code className="rounded bg-slate-200 px-1 dark:bg-slate-700">enterprise@example.com</code> with your contact address or link to an external form.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/product"
          className="text-slate-600 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 dark:text-slate-400 dark:hover:text-slate-100"
        >
          ← Product
        </Link>
        <Link
          href="/resources"
          className="text-slate-600 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 dark:text-slate-400 dark:hover:text-slate-100"
        >
          Resources →
        </Link>
      </div>
    </div>
  )
}
