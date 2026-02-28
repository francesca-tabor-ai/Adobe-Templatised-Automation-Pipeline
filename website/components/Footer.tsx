import Link from 'next/link'

const docLinks = [
  { href: 'https://github.com', label: 'Product vision (CGVIP)' },
  { href: 'https://github.com', label: 'Variant spec' },
  { href: 'https://github.com', label: 'Template spec' },
  { href: 'https://github.com', label: 'DAM metadata' },
  { href: 'https://github.com', label: 'Runbook' },
]

export default function Footer() {
  return (
    <footer className="border-t border-paper-border bg-paper-subdued">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link
              href="/"
              className="text-lg font-bold text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-muted"
            >
              CGVIP
            </Link>
            <p className="mt-3 text-sm text-ink-muted leading-relaxed">
              Creative Governance & Variant Intelligence Platform. AI-orchestrated creative automation for regulated enterprises.
            </p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">
              Product
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/product" className="text-sm text-ink-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-muted">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/use-cases" className="text-sm text-ink-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-muted">
                  Use cases
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-ink-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-muted">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">
              Resources
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/resources" className="text-sm text-ink-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-muted">
                  Documentation
                </Link>
              </li>
              {docLinks.slice(0, 3).map(({ href, label }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-ink-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-muted"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">
              Get in touch
            </h3>
            <p className="mt-4 text-sm text-ink-muted leading-relaxed">
              <Link href="/contact" className="font-medium text-ink hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-muted">
                Contact us
              </Link>
              {' '}for enterprise inquiries.
            </p>
          </div>
        </div>
        <div className="mt-16 border-t border-paper-border pt-8">
          <p className="text-center text-sm text-ink-subtle">
            CGVIP — Governed, intelligent, measurable creative production.
          </p>
        </div>
      </div>
    </footer>
  )
}
