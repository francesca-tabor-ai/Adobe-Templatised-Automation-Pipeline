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
    <footer className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link
              href="/"
              className="text-lg font-semibold text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 dark:text-slate-100"
            >
              CGVIP
            </Link>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Creative Governance & Variant Intelligence Platform. AI-orchestrated creative automation for regulated enterprises.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Product
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/product" className="text-sm text-slate-600 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 dark:text-slate-400 dark:hover:text-slate-100">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/use-cases" className="text-sm text-slate-600 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 dark:text-slate-400 dark:hover:text-slate-100">
                  Use cases
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-slate-600 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 dark:text-slate-400 dark:hover:text-slate-100">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Resources
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/resources" className="text-sm text-slate-600 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 dark:text-slate-400 dark:hover:text-slate-100">
                  Documentation
                </Link>
              </li>
              {docLinks.slice(0, 3).map(({ href, label }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-slate-600 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 dark:text-slate-400 dark:hover:text-slate-100"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Get in touch
            </h3>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
              <Link href="/contact" className="font-medium text-slate-900 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 dark:text-slate-100">
                Contact us
              </Link>
              {' '}for enterprise inquiries.
            </p>
          </div>
        </div>
        <div className="mt-12 border-t border-slate-200 pt-8 dark:border-slate-800">
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            CGVIP — Governed, intelligent, measurable creative production.
          </p>
        </div>
      </div>
    </footer>
  )
}
