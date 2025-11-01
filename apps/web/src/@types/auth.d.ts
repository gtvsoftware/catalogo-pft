export type UserData = {
  id: string
  code: string
  name: string
  nickname: string | null
  picture: string
  structure: [] | null
  ugb?: any
  empresa_id: any
}

export type Permissions = {
  [key: string]: boolean | string | number
}

export type Structure = {
  id: string
  name: string
  [key: string]: any
}[]

export type AuthState =
  | 'idle'
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'
  | 'error'

export type AuthContextType = {
  isAuthenticated: boolean
  authState: AuthState
  signOut: () => Promise<void>
  updateUserInfo: () => Promise<void>
  user: UserData | null
  permissions: Permissions | null
  structure: Structure | null
  error: string | null
  isLoading: boolean
  clearError: () => void
}

export type AuthProviderProps = {
  children: React.ReactNode
  isDisabled?: boolean
}

export enum AuthErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_TOKEN = 'INVALID_TOKEN',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface AuthConfig {
  autoRefresh?: boolean
  refreshInterval?: number
  redirectOnError?: boolean
  persistSession?: boolean
}
