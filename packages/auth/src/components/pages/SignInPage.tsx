'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { authUrlFromEnv, fullUrlFromEnv } from '../../utils/urls'

export async function SignInPage(): Promise<React.ReactElement> {
  const headersList = await headers()
  const url = String(headersList.get('x-url'))

  let callbackFromReq: string | null = null

  // Validate URL before parsing
  if (url && url !== 'null' && url !== 'undefined') {
    try {
      const parsedUrl = new URL(url)
      callbackFromReq = parsedUrl.searchParams.get('callbackUrl')
    } catch (error) {
      console.warn('Invalid URL in x-url header:', url, error)
      // URL is invalid, callbackFromReq remains null
    }
  }

  const callbackUrl = callbackFromReq ?? fullUrlFromEnv

  const authUrl = authUrlFromEnv.split('/api')[0]

  const destination = new URL(
    `${authUrl}/auth/signin?callbackUrl=${callbackUrl}`
  ).toString()

 redirect(destination)
 
 return <></>
}
