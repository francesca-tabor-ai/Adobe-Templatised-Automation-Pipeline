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
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
      <h1 className="text-4xl font-bold text-ink">
        Resources
      </h1>
      <p className="mt-5 max-w-3xl text-lg text-ink-muted leading-relaxed">
        Technical documentation and specs for the Adobe Templatised Automation Pipeline and CGVIP. Replace the links below with your repository URLs (e.g. GitHub raw or docs folder) when deploying.
      </p>

      <ul className="mt-12 space-y-4">
        {docs.map(({ title, description, href, external }) => (
          <li key={title}>
            {external ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-card border border-paper-border bg-paper p-6 shadow-soft transition hover:border-ink-subtle hover:shadow-soft-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-muted"
              >
                <h2 className="font-semibold text-ink">
                  {title}
                  <span className="ml-1.5 text-ink-subtle" aria-hidden>↗</span>
                </h2>
                <p className="mt-2 text-sm text-ink-muted leading-relaxed">
                  {description}
                </p>
              </a>
            ) : (
              <Link
                href={href}
                className="block rounded-card border border-paper-border bg-paper p-6 shadow-soft transition hover:border-ink-subtle hover:shadow-soft-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-muted"
              >
                <h2 className="font-semibold text-ink">
                  {title}
                </h2>
                <p className="mt-2 text-sm text-ink-muted leading-relaxed">
                  {description}
                </p>
              </Link>
            )}
          </li>
        ))}
      </ul>

      <p className="mt-10 text-sm text-ink-subtle leading-relaxed">
        To use in-repo paths (e.g. when the site is deployed alongside the repo), update the <code className="rounded bg-paper-subdued px-1.5 py-0.5 font-mono text-ink-muted">href</code> values in this page to point to <code className="rounded bg-paper-subdued px-1.5 py-0.5 font-mono text-ink-muted">/docs/...</code> or your documentation base URL.
      </p>

      <div className="mt-10">
        <Link
          href="/contact"
          className="inline-flex items-center justify-center rounded-ui bg-ink px-6 py-3.5 text-base font-semibold text-paper shadow-soft hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-muted"
        >
          Get in touch
        </Link>
      </div>
    </div>
  )
}
