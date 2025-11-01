import type { CookiesOptions } from '@auth/core/types'

import { getDomainWithoutSubdomain } from '../utils/getDomainWithoutSubdomain'

const nextAuthUrl = String(process.env.AUTH_URL)
const hostName = getDomainWithoutSubdomain(nextAuthUrl)

const domain = hostName === 'localhost' ? hostName : '.' + hostName

const useSecureCookies = nextAuthUrl.startsWith('https://')
export const cookiePrefix = useSecureCookies ? '__Secure-' : ''

const cookies: Partial<CookiesOptions> = {
  sessionToken: {
    name: `${cookiePrefix}next-auth.session-token`,
    options: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: useSecureCookies,
      domain
    }
  },
  callbackUrl: {
    name: `${cookiePrefix}next-auth.callback-url`,
    options: {
      httpOnly: true,
      sameSite: 'lax',
      secure: useSecureCookies,
      path: '/',
      domain
    }
  },
  csrfToken: {
    name: `${cookiePrefix}next-auth.csrf-token`,
    options: {
      httpOnly: true,
      sameSite: 'lax',
      secure: useSecureCookies,
      path: '/',
      domain
    }
  }
}

export { cookies, useSecureCookies }
