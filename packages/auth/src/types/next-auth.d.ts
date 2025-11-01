import type { User } from 'next-auth'

declare module 'next-auth' {
  export interface Session {
    user: User
    expires: string
    error: string
    refresh_token: string
    access_token: string
  }

  export interface RealmAccess {
    roles: any[]
  }

  export interface ResourceAccess {
    account: any[]
  }

  export interface User {
    id?: never
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
    oid: string
    preferred_username: string
    given_name: string
    family_name: string
    email: string
    picture: string
  }

  /**
   * Usually contains information about the provider being used
   * and also extends `TokenSet`, which is different tokens returned by OAuth Providers.
   */
  interface Account {
    provider: string
    type: string
    id: string
    accessToken: string
    accessTokenExpires?: any
    refreshToken: string
    idToken: string
    access_token: string
    expires_in: number
    expires_at: number
    refresh_expires_in: number
    refresh_token: string
    token_type: string
    id_token: string
    'not-before-policy': number
    session_state: string
    scope: string
  }
  /** The OAuth profile returned from your provider */
  interface Profile {
    sub: string
    email_verified: boolean
    name: string
    telephone: string
    preferred_username: string
    org_name: string
    given_name: string
    family_name: string
    email: string
  }
}

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    name: string
    email: string
    sub: string
    name: string
    email: string
    sub: string
    accessToken: string
    refreshToken: string
    accessTokenExpired: number
    refreshTokenExpired: number
    user: User
    error: string
    provider: string
    account: {
      id_token: string
      expires_at: number
      expires_in: number
      refresh_token: string
      provider: string
    }
  }
}

declare module 'next-auth' {
  interface Session {
    error?: 'RefreshAccessTokenError'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    access_token: string
    expires_at: number
    refresh_token: string
    error?: 'RefreshAccessTokenError'
    provider: string
    id_token: string
    accessTokenExpires: number
    decoded: any
    // refreshToken: string;
  }
}
