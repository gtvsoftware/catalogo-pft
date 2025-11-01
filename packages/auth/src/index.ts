import { jwtDecode } from 'jwt-decode'
import type { Session } from 'next-auth'
import { GetSessionParams, getSession, useSession } from 'next-auth/react'

import { cookiePrefix } from './config/cookies'

// Re-export everything from sub-modules
export * from './components'
export * from './hooks'
export * from './lib'
export * from './utils'

// Re-export config
export { cookiePrefix }

// Re-export external dependencies that are commonly used
export { useSession, jwtDecode }

// Custom function
async function getClientSession(
  params?: GetSessionParams
): Promise<Session | null> {
  return (await getSession(params)) as any
}

export * from './types'

export { getClientSession }
