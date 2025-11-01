/**
 * @fileoverview Criador de instância Axios com autenticação integrada
 *
 * Fornece uma função factory para criar instâncias do Axios completamente configuradas:
 * - Interceptors de autenticação automática para client e server-side
 * - Refresh automático de tokens
 * - Tratamento de erros de autenticação
 * - Integração com NextAuth e sistema de sessões
 * - Configuração flexível e extensível
 */

import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig
} from 'axios'
import { type Session } from 'next-auth'

import { auth } from '../lib/auth'

/**
 * Configurações para criação da instância Axios
 */
export interface CreateAxiosInstanceConfig {
  /** URL base para todas as requisições */
  baseURL: string
  /** Timeout padrão para requisições em millisegundos (padrão: 30000) */
  timeout?: number
  /** Headers adicionais para todas as requisições */
  defaultHeaders?: Record<string, string>
  /** Configurações personalizadas do Axios */
  axiosConfig?: AxiosRequestConfig
  /** Função chamada quando o refresh token falha (padrão: redirecionamento automático) */
  onRefreshError?: () => void | Promise<void>
  /** Função chamada quando uma requisição não autorizada é detectada */
  onUnauthorized?: (error: AxiosError) => void | Promise<void>
  /** Habilitar logs detalhados de debug (padrão: false) */
  enableDebugLogs?: boolean
}

/**
 * Interface para gerenciamento de refresh de tokens
 */
interface TokenManager {
  /** Indica se há um refresh em andamento */
  isRefreshing: boolean
  /** Promise do refresh atual para evitar múltiplos refreshes simultâneos */
  refreshPromise: Promise<Session | null> | null
}

/**
 * Constantes para configuração
 */
const AXIOS_CONSTANTS = {
  /** Timeout padrão em millisegundos */
  DEFAULT_TIMEOUT: 30000,
  /** Códigos de status que indicam token expirado */
  TOKEN_EXPIRED_CODES: [401, 403] as const,
  /** Headers de autenticação */
  AUTH_HEADER: 'Authorization',
  /** Prefixo do token Bearer */
  BEARER_PREFIX: 'Bearer',
  /** Tempo de buffer para refresh em segundos */
  REFRESH_BUFFER: 60
} as const

/**
 * Cria um gerenciador de tokens para evitar múltiplos refreshes simultâneos
 */
function createTokenManager(): TokenManager {
  return {
    isRefreshing: false,
    refreshPromise: null
  }
}

/**
 * Obtém a sessão atual do lado do cliente via fetch
 */
async function getClientSession(
  enableDebugLogs = false
): Promise<Session | null> {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
    const response = await fetch(`${appUrl}/api/auth/session`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`)
    }

    const session = await response.json()

    if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
      console.log('🌐 Sessão do cliente obtida:', {
        hasSession: !!session,
        hasAccessToken: !!session?.access_token,
        hasError: !!session?.error
      })
    }

    return session
  } catch (error) {
    if (enableDebugLogs) {
      console.error('❌ Erro ao obter sessão do cliente:', error)
    }
    return null
  }
}

/**
 * Obtém a sessão atual do lado do servidor
 */
async function getServerSession(
  enableDebugLogs = false
): Promise<Session | null> {
  if (typeof window !== 'undefined') {
    return null
  }

  try {
    const session = await auth()

    if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
      console.log('�️ Sessão do servidor obtida:', {
        hasSession: !!session,
        hasAccessToken: !!session?.access_token,
        hasError: !!session?.error
      })
    }

    return session
  } catch (error) {
    if (enableDebugLogs) {
      console.error('❌ Erro ao obter sessão do servidor:', error)
    }
    return null
  }
}

/**
 * Obtém a sessão atual detectando automaticamente o ambiente (client/server)
 */
async function getCurrentSession(
  enableDebugLogs = false
): Promise<Session | null> {
  if (typeof window !== 'undefined') {
    return await getClientSession(enableDebugLogs)
  } else {
    return await getServerSession(enableDebugLogs)
  }
}

/**
 * Verifica se o token precisa ser renovado
 */
function shouldRefreshToken(session: Session): boolean {
  // Verificar se tem erro de refresh
  if (session.error === 'RefreshAccessTokenError') {
    return true
  }

  // Verificar se tem data de expiração
  if (!session.expires) {
    return false
  }

  const currentTime = Math.floor(Date.now() / 1000)
  const expiresAt = Math.floor(new Date(session.expires).getTime() / 1000)

  return currentTime >= expiresAt - AXIOS_CONSTANTS.REFRESH_BUFFER
}

/**
 * Atualiza a sessão forçando um refresh dos tokens
 */
async function refreshSession(
  enableDebugLogs = false
): Promise<Session | null> {
  try {
    if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
      console.log('🔄 Iniciando refresh da sessão...')
    }

    let session: Session | null = null

    if (typeof window !== 'undefined') {
      // Cliente: usar fetch para forçar refresh
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
      const response = await fetch(`${appUrl}/api/auth/session`, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store'
      })

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`)
      }

      session = await response.json()
    } else {
      // Servidor: usar auth() diretamente
      session = await auth()
    }

    if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
      console.log('✅ Sessão atualizada:', {
        hasSession: !!session,
        hasAccessToken: !!session?.access_token,
        hasError: !!session?.error
      })
    }

    return session
  } catch (error) {
    if (enableDebugLogs) {
      console.error('❌ Erro ao atualizar sessão:', error)
    }
    return null
  }
}

/**
 * Redireciona para login baseado no ambiente
 */
function redirectToLogin(): void {
  if (typeof window !== 'undefined') {
    window.location.href = '/api/auth/signin'
  }
  // No servidor, não fazemos redirecionamento automático
}

/**
 * Verifica se o erro indica token expirado ou não autorizado
 */
function isAuthError(error: AxiosError): boolean {
  return (
    error.response?.status !== undefined &&
    (AXIOS_CONSTANTS.TOKEN_EXPIRED_CODES as readonly number[]).includes(
      error.response.status
    )
  )
}

/**
 * Interceptor de requisição para adicionar token de autorização
 */
function createRequestInterceptor(
  tokenManager: TokenManager,
  enableDebugLogs = false
) {
  return async (
    config: InternalAxiosRequestConfig
  ): Promise<InternalAxiosRequestConfig> => {
    const session = await getCurrentSession(enableDebugLogs)

    if (session?.access_token) {
      // Verificar se o token precisa ser renovado
      if (shouldRefreshToken(session)) {
        if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
          console.log('⚠️ Token expirando, tentando renovar antes da requisição')
        }

        // Se já há um refresh em andamento, aguardar
        if (tokenManager.isRefreshing && tokenManager.refreshPromise) {
          try {
            await tokenManager.refreshPromise
            const newSession = await getCurrentSession(enableDebugLogs)
            if (newSession?.access_token) {
              config.headers[AXIOS_CONSTANTS.AUTH_HEADER] =
                `${AXIOS_CONSTANTS.BEARER_PREFIX} ${newSession.access_token}`
            }
          } catch (error) {
            if (enableDebugLogs) {
              console.error(
                '❌ Falha ao aguardar refresh no interceptor de requisição:',
                error
              )
            }
          }
        } else {
          // Iniciar novo refresh
          tokenManager.isRefreshing = true
          tokenManager.refreshPromise = refreshSession(enableDebugLogs)

          try {
            const newSession = await tokenManager.refreshPromise
            if (newSession?.access_token && !newSession.error) {
              config.headers[AXIOS_CONSTANTS.AUTH_HEADER] =
                `${AXIOS_CONSTANTS.BEARER_PREFIX} ${newSession.access_token}`
            } else {
              // Token ainda inválido, usar o atual mesmo assim
              config.headers[AXIOS_CONSTANTS.AUTH_HEADER] =
                `${AXIOS_CONSTANTS.BEARER_PREFIX} ${session.access_token}`
            }
          } catch (error) {
            if (enableDebugLogs) {
              console.error(
                '❌ Falha no refresh no interceptor de requisição:',
                error
              )
            }
            // Em caso de erro, usar token atual
            config.headers[AXIOS_CONSTANTS.AUTH_HEADER] =
              `${AXIOS_CONSTANTS.BEARER_PREFIX} ${session.access_token}`
          } finally {
            tokenManager.isRefreshing = false
            tokenManager.refreshPromise = null
          }
        }
      } else {
        // Token ainda válido, usar normalmente
        config.headers[AXIOS_CONSTANTS.AUTH_HEADER] =
          `${AXIOS_CONSTANTS.BEARER_PREFIX} ${session.access_token}`
      }

      if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
        console.log('🔑 Token de autorização adicionado à requisição')
      }
    } else if (enableDebugLogs) {
      console.warn('⚠️ Nenhum token de acesso disponível para a requisição')
    }

    return config
  }
}

/**
 * Interceptor de resposta para tratamento de erros de autenticação
 */
function createResponseInterceptor(
  axiosInstance: AxiosInstance,
  tokenManager: TokenManager,
  onRefreshError?: () => void | Promise<void>,
  onUnauthorized?: (error: AxiosError) => void | Promise<void>,
  enableDebugLogs = false
) {
  const onFulfilled = (response: AxiosResponse) => {
    if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
      console.log('✅ Requisição bem-sucedida:', {
        status: response.status,
        url: response.config.url
      })
    }
    return response
  }

  const onRejected = async (error: AxiosError): Promise<any> => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
      console.log('❌ Erro na requisição:', {
        status: error.response?.status,
        url: originalRequest?.url,
        isAuthError: isAuthError(error)
      })
    }

    // Verificar se é erro de autenticação e se não é uma retry
    if (isAuthError(error) && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true

      // Chamar callback personalizado se fornecido
      if (onUnauthorized) {
        await onUnauthorized(error)
      }

      // Se já há um refresh em andamento, aguardar
      if (tokenManager.isRefreshing && tokenManager.refreshPromise) {
        if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
          console.log('⏳ Aguardando refresh em andamento...')
        }

        try {
          await tokenManager.refreshPromise
          // Tentar novamente a requisição original
          return axiosInstance(originalRequest)
        } catch (refreshError) {
          if (enableDebugLogs) {
            console.error('❌ Falha no refresh aguardado:', refreshError)
          }
          return Promise.reject(error)
        }
      }

      // Iniciar novo refresh
      tokenManager.isRefreshing = true
      tokenManager.refreshPromise = refreshSession(enableDebugLogs)

      try {
        const newSession = await tokenManager.refreshPromise

        if (newSession?.access_token && !newSession.error) {
          if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
            console.log('✅ Token renovado, tentando requisição novamente')
          }

          // Atualizar token na requisição original
          originalRequest.headers[AXIOS_CONSTANTS.AUTH_HEADER] =
            `${AXIOS_CONSTANTS.BEARER_PREFIX} ${newSession.access_token}`

          // Tentar novamente a requisição original
          return axiosInstance(originalRequest)
        } else {
          throw new Error('Sessão inválida após refresh')
        }
      } catch (refreshError) {
        if (enableDebugLogs) {
          console.error('💥 Falha crítica no refresh de token:', refreshError)
        }

        // Chamar callback de erro de refresh
        if (onRefreshError) {
          await onRefreshError()
        } else {
          // Comportamento padrão: redirecionar para login
          if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
            console.log(
              '🚪 Redirecionando para login devido à falha no refresh'
            )
          }
          redirectToLogin()
        }

        return Promise.reject(error)
      } finally {
        tokenManager.isRefreshing = false
        tokenManager.refreshPromise = null
      }
    }

    return Promise.reject(error)
  }

  return { onFulfilled, onRejected }
}

/**
 * Cria uma instância do Axios completamente configurada com autenticação
 *
 * A instância retornada inclui:
 * - Interceptors automáticos para adicionar tokens de autorização
 * - Refresh automático de tokens quando expirados
 * - Tratamento inteligente de erros de autenticação
 * - Prevenção de múltiplos refreshes simultâneos
 * - Callbacks customizáveis para eventos de auth
 *
 * @param config - Configurações para a instância Axios
 * @returns Instância do Axios configurada com autenticação
 *
 * @example
 * ```typescript
 * // Uso básico
 * const api = createAxiosInstance({
 *   baseURL: 'https://api.exemplo.com'
 * })
 *
 * // Uso avançado com callbacks
 * const api = createAxiosInstance({
 *   baseURL: 'https://api.exemplo.com',
 *   timeout: 15000,
 *   defaultHeaders: {
 *     'Content-Type': 'application/json'
 *   },
 *   enableDebugLogs: true,
 *   onRefreshError: async () => {
 *     // Lógica customizada quando refresh falha
 *     console.log('Redirect para login')
 *   },
 *   onUnauthorized: async (error) => {
 *     // Lógica customizada para erros 401/403
 *     console.log('Requisição não autorizada:', error)
 *   }
 * })
 *
 * // Usar normalmente como qualquer instância Axios
 * const response = await api.get('/users')
 * const newUser = await api.post('/users', userData)
 * ```
 */
export function createAxiosInstance(
  config: CreateAxiosInstanceConfig
): AxiosInstance {
  const {
    baseURL,
    timeout = AXIOS_CONSTANTS.DEFAULT_TIMEOUT,
    defaultHeaders = {},
    axiosConfig = {},
    onRefreshError,
    onUnauthorized,
    enableDebugLogs = false
  } = config

  if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
    console.log('🔧 Criando instância Axios com configuração:', {
      baseURL,
      timeout,
      hasDefaultHeaders: Object.keys(defaultHeaders).length > 0,
      hasCustomConfig: Object.keys(axiosConfig).length > 0
    })
  }

  // Criar instância do Axios com configurações básicas
  const axiosInstance = axios.create({
    baseURL,
    timeout,
    headers: {
      'Content-Type': 'application/json',
      ...defaultHeaders
    },
    ...axiosConfig
  })

  // Criar gerenciador de tokens
  const tokenManager = createTokenManager()

  // Configurar interceptor de requisição
  axiosInstance.interceptors.request.use(
    createRequestInterceptor(tokenManager, enableDebugLogs),
    (error: any) => {
      if (enableDebugLogs) {
        console.error('❌ Erro no interceptor de requisição:', error)
      }
      return Promise.reject(error)
    }
  )

  // Configurar interceptor de resposta
  const { onFulfilled, onRejected } = createResponseInterceptor(
    axiosInstance,
    tokenManager,
    onRefreshError,
    onUnauthorized,
    enableDebugLogs
  )

  axiosInstance.interceptors.response.use(onFulfilled, onRejected)

  if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
    console.log('✅ Instância Axios criada e configurada com sucesso')
  }

  return axiosInstance
}

/**
 * Cria uma instância Axios com integração ao sistema de autenticação
 *
 * Esta função pode ser usada tanto em componentes React quanto em código server-side.
 * Para uso em componentes React, considere usar useMemo para otimização.
 *
 * @param config - Configurações para a instância Axios
 * @returns Instância do Axios configurada
 *
 * @example
 * ```tsx
 * // Em um componente React
 * function MyComponent() {
 *   const api = useMemo(() => createAxiosInstance({
 *     baseURL: 'https://api.exemplo.com'
 *   }), [])
 *
 *   const fetchData = async () => {
 *     const response = await api.get('/data')
 *     return response.data
 *   }
 *
 *   // ...
 * }
 *
 * // Em uma função server-side
 * async function getServerSideProps() {
 *   const api = createAxiosInstance({
 *     baseURL: 'https://api.exemplo.com'
 *   })
 *
 *   const data = await api.get('/data')
 *   return { props: { data: data.data } }
 * }
 * ```
 */
export function useAxiosInstance(
  config: CreateAxiosInstanceConfig
): AxiosInstance {
  return createAxiosInstance(config)
}
