'use client'

import { useEffect } from 'react'
import Link from 'next/link'

const INGEST = 'http://127.0.0.1:7602/ingest/45d7342a-f192-460c-af78-1f88074d2469'
const SESSION = '0efcde'

export default function NotFound() {
  useEffect(() => {
    // #region agent log
    fetch(INGEST, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': SESSION },
      body: JSON.stringify({
        sessionId: SESSION,
        hypothesisId: 'H2_H3',
        location: 'not-found.tsx:mount',
        message: 'Next.js 404 page rendered',
        data: { userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '' },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion
  }, [])

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-ink">404 — Page not found</h1>
      <p className="mt-2 text-ink-muted">This route does not exist.</p>
      <Link href="/" className="mt-6 inline-block text-ink underline hover:no-underline">
        Go home
      </Link>
    </div>
  )
}
