import { SignInPage, SignOutPage } from '@terraviva/auth/components'
import { redirect } from 'next/navigation'

type PageProps = {
  params: Promise<{
    page: string
  }>
}

export default async function Page({ params }: PageProps) {
  const { page } = await params

  if (page === 'signin') {
    return <SignInPage />
  }

  if (page === 'signout') {
    return <SignOutPage />
  }

  redirect('/')
}
