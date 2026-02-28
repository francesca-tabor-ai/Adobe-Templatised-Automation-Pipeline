'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

const INGEST = 'http://127.0.0.1:7602/ingest/45d7342a-f192-460c-af78-1f88074d2469'
const SESSION = '0efcde'

export default function DebugRouteLogger() {
  const pathname = usePathname()

  useEffect(() => {
    // #region agent log
    fetch(INGEST, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': SESSION },
      body: JSON.stringify({
        sessionId: SESSION,
        hypothesisId: 'H1_H2_H5',
        location: 'DebugRouteLogger.tsx:mount',
        message: 'Page loaded',
        data: {
          pathname: pathname ?? null,
          pathnameLength: pathname?.length ?? 0,
          hasTrailingSlash: pathname?.endsWith('/') ?? false,
          isRoot: pathname === '/' || pathname === '',
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion
  }, [pathname])

  return null
}
