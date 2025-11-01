'use server'

import { redirect } from 'next/navigation'

import { authUrlFromEnv, fullUrlFromEnv } from '../../utils/urls'

export async function SignOutPage(): Promise<React.ReactElement> {
  const authUrl = authUrlFromEnv.split('/api')[0]

  const destination = new URL(
    `${authUrl}/auth/signout?callbackUrl=${fullUrlFromEnv}`
  ).toString()

  redirect(destination)

  return <></>
}
