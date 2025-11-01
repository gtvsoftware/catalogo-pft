/**
 * @fileoverview Hook personalizado para gerenciamento de sessão
 *
     try {
      if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') console.log('🔄 Iniciando atualização manual da sessão...')

      const result = await update()

      setLastUpdate(Date.now())

      if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') console.log('✅ Sessão atualizada com sucesso:', {
        hasData: !!result,
        timestamp: new Date().toISOString()
      })

      return resultcionalidades avançadas para gerenciamento de sessão:
 * - Atualização automática da sessão
 * - Detecção de expiração de tokens
 * - Refresh manual de tokens
 * - Estados de loading e erro
 */

'use client'

import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useState } from 'react'

import type { Session } from '../types'

/**
 * Estado da sessão com informações adicionais
 */
interface SessionState {
  /** Dados da sessão */
  data: Session | null
  /** Status da sessão */
  status: 'loading' | 'authenticated' | 'unauthenticated'
  /** Indica se está atualizando */
  isUpdating: boolean
  /** Último erro ocorrido */
  error: string | null
  /** Timestamp da última atualização */
  lastUpdate: number | null
}

/**
 * Hook personalizado para gerenciamento avançado de sessão
 *
 * Fornece funcionalidades além do useSession padrão:
 * - Controle de estado de atualização
 * - Detecção de expiração de tokens
 * - Refresh manual com feedback
 * - Logging detalhado de operações
 *
 * @returns Estado e funções para gerenciamento da sessão
 *
 * @example
 * ```tsx
 * const { data, status, refreshSession, isTokenExpired } = useAuthSession()
 *
 * // Verificar se token está expirado
 * if (isTokenExpired()) {
 *   await refreshSession()
 * }
 *
 * // Atualizar sessão manualmente
 * await refreshSession()
 * ```
 */
export function useAuthSession() {
  const { data: sessionData, status, update } = useSession()
  // Cast to augmented Session type to access custom properties
  const data = sessionData as Session | null
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<number | null>(null)

  /**
   * Atualiza a sessão com tratamento de erros
   */
  const refreshSession = useCallback(async () => {
    if (isUpdating) {
      console.warn('🔄 Atualização já em andamento, ignorando...')
      return
    }

    setIsUpdating(true)
    setError(null)

    try {
      if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true')
        console.log('🔄 Iniciando atualização manual da sessão...')

      const result = await update()

      setLastUpdate(Date.now())

      if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true')
        console.log('✅ Sessão atualizada com sucesso:', {
          hasData: !!result,
          timestamp: new Date().toISOString()
        })

      return result
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro desconhecido'

      console.error('❌ Falha ao atualizar sessão:', errorMessage)

      setError(errorMessage)
      throw err
    } finally {
      setIsUpdating(false)
    }
  }, [update, isUpdating])

  /**
   * Verifica se o token de acesso está expirado
   */
  const isTokenExpired = useCallback(() => {
    if (!data?.expires) return false

    const now = Math.floor(Date.now() / 1000)
    const expiresAt = Math.floor(new Date(data.expires).getTime() / 1000)
    const isExpired = now >= expiresAt

    if (isExpired) {
      console.warn('⏰ Token de acesso expirado:', {
        expiresAt,
        currentTime: now,
        expiredBy: now - expiresAt
      })
    }

    return isExpired
  }, [data?.expires])

  /**
   * Verifica se há erro de refresh de token
   */
  const hasRefreshError = useCallback(() => {
    return data?.error === 'RefreshAccessTokenError'
  }, [data?.error])

  /**
   * Verifica se a sessão está saudável
   */
  const isSessionHealthy = useCallback(() => {
    return (
      status === 'authenticated' &&
      !!data?.access_token &&
      !hasRefreshError() &&
      !isTokenExpired()
    )
  }, [status, data?.access_token, hasRefreshError, isTokenExpired])

  // Limpar erro quando a sessão muda
  useEffect(() => {
    if (error && status === 'authenticated' && data) {
      setError(null)
    }
  }, [error, status, data])

  // Log de mudanças de estado
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true')
      console.log('📊 Estado da sessão atualizado:', {
        status,
        hasData: !!data,
        hasAccessToken: !!data?.access_token,
        hasRefreshToken: !!data?.refresh_token,
        hasError: !!data?.error,
        isUpdating,
        isTokenExpired: isTokenExpired(),
        isHealthy: isSessionHealthy()
      })
  }, [status, data, isUpdating, isTokenExpired, isSessionHealthy])

  const sessionState: SessionState = {
    data,
    status,
    isUpdating,
    error,
    lastUpdate
  }

  return {
    ...sessionState,
    refreshSession,
    isTokenExpired,
    hasRefreshError,
    isSessionHealthy
  }
}
