import { auth } from '@terraviva/auth'

export async function authWrapper() {
  if (process.env.NEXT_PUBLIC_DISABLE_AUTH) {
    return {
      user: {
        oid: '0F01E5A1-111B-48BC-A14C-12A70DEABC08',
        name: 'Diogo Silva',
        picture: '35313c31-1bd2-415f-81e8-842bc6eb3f22.png'
      }
    }
  }

  return await auth()
}
