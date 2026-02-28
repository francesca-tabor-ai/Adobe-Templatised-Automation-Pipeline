import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Resources — CGVIP',
  description: 'Documentation and technical resources for the Creative Governance & Variant Intelligence Platform and Adobe Templatised Automation Pipeline.',
}

type DocLink = {
  title: string
  description: string
  href: string
  external?: boolean
}

const docs: DocLink[] = [
  {
    title: 'CGVIP Product Vision',
    description: 'Product vision, multi-agent architecture, requirements, and roadmap.',
    href: 'https://github.com',
    external: true,
  },
  {
    title: 'Variant Spec',
    description: 'Variation contract: locked vs variable elements, approval, compliance.',
    href: 'https://github.com',
    external: true,
  },
  {
    title: 'Template Spec',
    description: 'Per-app template rules for InDesign, Photoshop, and After Effects.',
    href: 'https://github.com',
    external: true,
  },
  {
    title: 'DAM Metadata',
    description: 'DAM metadata schema and sidecar generation.',
    href: 'https://github.com',
    external: true,
  },
  {
    title: 'Runbook',
    description: 'How to run the pipeline and troubleshoot.',
    href: 'https://github.com',
    external: true,
  },
]

export default function ResourcesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
        Resources
      </h1>
      <p className="mt-4 max-w-3xl text-lg text-slate-600 dark:text-slate-400">
        Technical documentation and specs for the Adobe Templatised Automation Pipeline and CGVIP. Replace the links below with your repository URLs (e.g. GitHub raw or docs folder) when deploying.
      </p>

      <ul className="mt-10 space-y-4">
        {docs.map(({ title, description, href, external }) => (
          <li key={title}>
            {external ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border border-slate-200 bg-white p-6 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600 dark:hover:bg-slate-800"
              >
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                  {title}
                  <span className="ml-1.5 text-slate-400" aria-hidden>↗</span>
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  {description}
                </p>
              </a>
            ) : (
              <Link
                href={href}
                className="block rounded-lg border border-slate-200 bg-white p-6 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600 dark:hover:bg-slate-800"
              >
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                  {title}
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  {description}
                </p>
              </Link>
            )}
          </li>
        ))}
      </ul>

      <p className="mt-10 text-sm text-slate-500 dark:text-slate-400">
        To use in-repo paths (e.g. when the site is deployed alongside the repo), update the <code className="rounded bg-slate-200 px-1 dark:bg-slate-700">href</code> values in this page to point to <code className="rounded bg-slate-200 px-1 dark:bg-slate-700">/docs/...</code> or your documentation base URL.
      </p>

      <div className="mt-10">
        <Link
          href="/contact"
          className="inline-flex items-center justify-center rounded-md bg-slate-900 px-6 py-3 text-base font-semibold text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
        >
          Get in touch
        </Link>
      </div>
    </div>
  )
}
