import { authWrapper } from '@/utils/authWrapper'

import FlowerCatalogBuilder from './page.client'

export default async function Page() {
  const session = await authWrapper()

  if (!session) {
    return <></>
  }

  return <FlowerCatalogBuilder user={session.user} />
}
