import { auth } from '@terraviva/auth'
import axios, {
  type AxiosError,
  AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig
} from 'axios'

import { getAuth } from '@/lib/auth'

const getMobileAPIClient = (): AxiosInstance => {
  let clientSession: any = null

  async function getClientSession() {
    if (typeof window !== 'undefined') {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/session`
        )
        if (response.ok) {
          clientSession = await response.json()
          return clientSession
        }
      } catch (error) {
        console.error('Failed to fetch client session:', error)
      }
    }
    return null
  }

  async function getServerSession() {
    if (typeof window === 'undefined') {
      try {
        const session = await auth()
        return session
      } catch (error) {
        console.error('Failed to get server session:', error)
      }
    }
    return null
  }

  class KeycloakTokenManager {
    private static instance: KeycloakTokenManager
    private refreshPromise: Promise<string | null> | null = null
    private isRefreshing = false

    static getInstance(): KeycloakTokenManager {
      if (!KeycloakTokenManager.instance) {
        KeycloakTokenManager.instance = new KeycloakTokenManager()
      }
      return KeycloakTokenManager.instance
    }

    async getValidToken(): Promise<string | null> {
      const session = await this.getSession()

      if (!session?.access_token) {
        return null
      }

      if (session.error === 'RefreshAccessTokenError') {
        console.warn('Session has refresh token error')

        if (typeof window !== 'undefined') {
          window.location.href = '/api/auth/signin'
        }
        return null
      }

      const currentTime = Math.floor(Date.now() / 1000)
      const bufferTime = 60

      if (
        session.expires_at &&
        currentTime >= session.expires_at - bufferTime
      ) {
        return await this.refreshToken()
      }

      return session.access_token
    }

    private async getSession() {
      if (typeof window !== 'undefined') {
        return await getClientSession()
      } else {
        return await getServerSession()
      }
    }

    async refreshToken(): Promise<string | null> {
      if (this.isRefreshing && this.refreshPromise) {
        return this.refreshPromise
      }

      this.isRefreshing = true
      this.refreshPromise = this.performTokenRefresh()

      try {
        const newToken = await this.refreshPromise
        return newToken
      } finally {
        this.isRefreshing = false
        this.refreshPromise = null
      }
    }

    private async performTokenRefresh(): Promise<string | null> {
      try {
        if (typeof window !== 'undefined') {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/session`,
            {
              method: 'GET',
              cache: 'no-store'
            }
          )

          if (response.ok) {
            const newSession = await response.json()
            clientSession = newSession

            if (newSession?.error === 'RefreshAccessTokenError') {
              throw new Error('Refresh token expired')
            }

            return newSession?.access_token || null
          }
        } else {
          const newSession = await getAuth()

          if (newSession?.error === 'RefreshAccessTokenError') {
            throw new Error('Refresh token expired')
          }

          return newSession?.access_token || null
        }

        return null
      } catch (error) {
        console.error('Token refresh failed:', error)

        if (typeof window !== 'undefined') {
          window.location.href = '/api/auth/signin'
        }

        return null
      }
    }
  }

  const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BFF_MOBILE_URL || '/api',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      'authorization-method': 'oidc'
    }
  })

  const tokenManager = KeycloakTokenManager.getInstance()

  apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      try {
        const token = await tokenManager.getValidToken()

        if (token) {
          config.headers = config.headers || {}
          config.headers.Authorization = `Bearer ${token}`
        }
      } catch (error) {
        console.error('Error getting token for request:', error)
      }

      return config
    },
    (error: AxiosError) => {
      return Promise.reject(error)
    }
  )

  apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean
      }

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true

        try {
          const newToken = await tokenManager.refreshToken()

          if (newToken && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return apiClient(originalRequest)
          }
        } catch (refreshError) {
          console.error('Token refresh in interceptor failed:', refreshError)

          if (typeof window !== 'undefined') {
            window.location.href = '/api/auth/signin'
          }
        }
      }

      return Promise.reject(error)
    }
  )

  return apiClient
}

export { getMobileAPIClient }
