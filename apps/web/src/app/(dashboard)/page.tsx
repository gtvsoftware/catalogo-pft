import { auth } from '@terraviva/auth'

import CatalogosListPage from './page.client'

export default async function () {
  const session = await auth()

  if (!session) {
    return <></>
  }

  return <CatalogosListPage user={session.user} />
}
