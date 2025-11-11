import { authWrapper } from '@/utils/authWrapper'

import CatalogosListPage from './page.client'

export default async function () {
  const session = await authWrapper()

  if (!session) {
    return <></>
  }

  return <CatalogosListPage user={session.user} />
}
