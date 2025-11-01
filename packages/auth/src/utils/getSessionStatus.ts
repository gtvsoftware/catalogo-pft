/**
 * @fileoverview Utilitário para validação de status da sessão
 *
 * Verifica a validade da sessão do usuário através de introspecção de token:
 * - Validação de tokens de acesso via endpoint OAuth2
 * - Timeout configurável para evitar travamentos
 * - Tratamento robusto de erros de rede
 * - Logging detalhado para debugging
 */

'use server'

import { auth } from '../lib/auth'

/**
 * Constantes de configuração para validação de sessão
 */
const SESSION_CONFIG = {
  /** Timeout em milissegundos para requisição de introspecção */
  TIMEOUT_MS: 10000,
  /** Endpoint de introspecção OAuth2 */
  INTROSPECT_ENDPOINT: '/protocol/openid-connect/introspect'
} as const

/**
 * Verifica se a sessão do usuário ainda é válida fazendo uma requisição de introspecção de token
 *
 * Esta função valida a sessão atual do usuário consultando o servidor de autenticação
 * através do endpoint de introspecção OAuth2. É útil para verificar se o token de acesso
 * ainda é válido antes de realizar operações que requerem autenticação.
 *
 * @returns Promise<boolean> - true se a sessão for válida, false caso contrário
 *
 * @example
 * ```typescript
 * const isValid = await getSessionStatus()
 * if (isValid) {
 *   console.log('Sessão válida - pode prosseguir com operações autenticadas')
 * } else {
 *   console.log('Sessão expirada - redirecionar para login')
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Uso em middleware ou API routes
 * if (!(await getSessionStatus())) {
 *   return NextResponse.redirect('/auth/signin')
 * }
 * ```
 */
export const getSessionStatus = async (): Promise<boolean> => {
  if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true')
    console.log('🔍 Verificando status da sessão...')

  const session = await auth()

  if (!session?.access_token) {
    if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true')
      console.log('❌ Sessão inválida: nenhum token de acesso encontrado')
    return false
  }

  const issuerUrl = process.env.AUTH_ISSUER_URL
  if (!issuerUrl) {
    console.error('❌ AUTH_ISSUER_URL não configurada')
    return false
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(
      () => controller.abort(),
      SESSION_CONFIG.TIMEOUT_MS
    )

    if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true')
      console.log('🌐 Fazendo requisição de introspecção de token...')

    const response = await fetch(
      `${issuerUrl}${SESSION_CONFIG.INTROSPECT_ENDPOINT}`,
      {
        method: 'POST', // Corrigido: deve ser POST para introspecção
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          token: session.access_token
        }),
        signal: controller.signal
      }
    )

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.warn('⚠️ Introspecção falhou:', {
        status: response.status,
        statusText: response.statusText
      })
      return false
    }

    const introspectData = await response.json()

    // Verificar se o token é ativo segundo a resposta de introspecção
    const isActive = introspectData.active === true

    if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true')
      console.log('✅ Introspecção concluída:', {
        tokenActive: isActive,
        expiresAt: introspectData.exp,
        clientId: introspectData.client_id
      })

    return isActive
  } catch (error: any) {
    // Trata timeout ou erros de rede
    if (error.name === 'AbortError') {
      console.warn(
        '⏰ Requisição de introspecção expirou após',
        SESSION_CONFIG.TIMEOUT_MS,
        'ms'
      )
    } else {
      console.warn('💥 Erro na introspecção de token:', error.message)
    }
    return false
  }
}
