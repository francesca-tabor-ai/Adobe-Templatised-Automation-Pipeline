'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/product', label: 'Product' },
  { href: '/use-cases', label: 'Use Cases' },
  { href: '/resources', label: 'Resources' },
  { href: '/contact', label: 'Contact' },
]

export default function Header() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="text-xl font-semibold text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 dark:text-slate-100"
        >
          CGVIP
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 ${
                pathname === href
                  ? 'text-slate-900 dark:text-slate-100'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="flex h-10 w-10 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 dark:text-slate-400 dark:hover:bg-slate-800 md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile nav */}
      <div
        id="mobile-menu"
        className={`border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 md:hidden ${
          menuOpen ? 'block' : 'hidden'
        }`}
      >
        <nav className="flex flex-col gap-0 px-4 py-4" aria-label="Main">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={`rounded-md px-3 py-2 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 ${
                pathname === href
                  ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
