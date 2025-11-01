import 'next-auth'

declare module 'next-auth' {
  export interface RealmAccess {
    roles: any[]
  }

  export interface ResourceAccess {
    account: any[]
  }

  export interface User {
    id?: never
    oid: string
    exp: number
    iat: number
    auth_time: number
    jti: string
    iss: string
    aud: string
    sub: string
    typ: string
    azp: string
    sid: string
    acr: string
    'allowed-origins': string[]
    realm_access: RealmAccess
    resource_access: ResourceAccess
    scope: string
    email_verified: boolean
    name: string
    preferred_username: string
    given_name: string
    family_name: string
    email: string
    picture: string
  }

  export interface Session {
    user: User
    expires: string
    error?: 'RefreshAccessTokenError' | string
    refresh_token: string
    access_token: string
  }
}
