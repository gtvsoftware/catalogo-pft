import { auth } from '@terraviva/auth'

import FlowerCatalogBuilder from './page.client'

export default async function Page() {
  const session = await auth()

  if (!session) {
    return <></>
  }

  console.log(session.user)

  return <FlowerCatalogBuilder user={session.user} />
}
