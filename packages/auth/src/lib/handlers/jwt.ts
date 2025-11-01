/**
 * @fileoverview Handler JWT para NextAuth
 *
 * Gerencia o ciclo de vida dos tokens JWT incluindo:
 * - Armazenamento inicial de tokens no login
 * - Refresh automático de tokens expirados
 * - Limpeza de tokens em caso de falha
 * - Suporte a triggers manuais de atualização
 */

import { type Account, type Profile, type User } from 'next-auth'
import { type AdapterUser } from 'next-auth/adapters'
import { type JWT } from 'next-auth/jwt'

import { getTokenFromIssuer } from '../../utils/getTokenFromIssuer'

/**
 * Propriedades do handler JWT do NextAuth
 */
interface JwtHandlerProps {
  /** Token JWT atual */
  token: JWT
  /** Dados do usuário */
  user: User | AdapterUser
  /** Conta OAuth (disponível apenas no login inicial) */
  account: Account | null
  /** Perfil do usuário (opcional) */
  profile?: Profile
  /** Trigger que iniciou o callback */
  trigger?: 'signIn' | 'signUp' | 'update'
  /** Indica se é um novo usuário */
  isNewUser?: boolean
  /** Dados da sessão (opcional) */
  session?: any
}

/**
 * Constantes para configuração do JWT
 */
const JWT_CONSTANTS = {
  /** Tempo padrão de expiração em segundos (5 minutos) */
  DEFAULT_EXPIRY: 300,
  /** Tempo de buffer para refresh em segundos (1 minuto) */
  REFRESH_BUFFER: 60,
  /** Erro de refresh de token */
  REFRESH_ERROR: 'RefreshAccessTokenError'
} as const

/**
 * Token JWT estendido com propriedades customizadas
 */
interface ExtendedJWT extends JWT {
  /** Token de acesso OAuth */
  access_token: string
  /** Timestamp de expiração */
  expires_at: number
  /** Token de refresh OAuth */
  refresh_token: string
}

/**
 * Faz refresh do token de acesso usando o refresh token
 *
 * @param token - Token JWT atual com refresh_token
 * @returns Token JWT atualizado com novos tokens
 * @throws Error quando não há refresh token ou falha na renovação
 *
 * @private
 */
async function refreshAccessToken(token: ExtendedJWT): Promise<ExtendedJWT> {
  if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true')
    console.log('🔄 Tentando renovar token...', {
      hasRefreshToken: !!token.refresh_token,
      tokenExpiry: token.expires_at,
      currentTime: Math.floor(Date.now() / 1000)
    })

  if (!token.refresh_token) {
    throw new Error('Token de refresh não disponível')
  }

  try {
    const refreshedTokens = await getTokenFromIssuer({
      refresh_token: token.refresh_token
    })

    if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true')
      console.log('✅ Renovação de token bem-sucedida', {
        hasAccessToken: !!refreshedTokens.access_token,
        hasRefreshToken: !!refreshedTokens.refresh_token,
        expiresIn: refreshedTokens.expires_in
      })

    const now = Math.floor(Date.now() / 1000)
    const expiresIn = refreshedTokens.expires_in || JWT_CONSTANTS.DEFAULT_EXPIRY

    return {
      ...token,
      access_token: refreshedTokens.access_token || token.access_token,
      expires_at: now + expiresIn,
      refresh_token: refreshedTokens.refresh_token || token.refresh_token
    }
  } catch (error) {
    console.warn(
      '⚠️ Falha na renovação do token, sinalizando necessidade de reautenticação:',
      error
    )

    // Instead of throwing, return token with error flag to trigger re-authentication
    return {
      ...token,
      error: JWT_CONSTANTS.REFRESH_ERROR,
      // Mark token as expired to force logout/re-authentication
      expires_at: Math.floor(Date.now() / 1000) - 1
    }
  }
}

/**
 * Verifica se o token precisa ser renovado
 *
 * @param token - Token JWT a ser verificado
 * @param bufferTime - Tempo de buffer em segundos (padrão: 60s)
 * @returns true se o token deve ser renovado
 *
 * @private
 */
function shouldRefreshToken(
  token: ExtendedJWT,
  bufferTime = JWT_CONSTANTS.REFRESH_BUFFER
): boolean {
  if (!token.expires_at) return false

  const now = Math.floor(Date.now() / 1000)
  return now >= token.expires_at - bufferTime
}

/**
 * Processa login inicial armazenando tokens da conta OAuth
 *
 * @param token - Token JWT base
 * @param account - Conta OAuth com tokens
 * @returns Token JWT com tokens OAuth armazenados
 *
 * @private
 */
function handleInitialSignIn(token: JWT, account: Account): ExtendedJWT {
  const now = Math.floor(Date.now() / 1000)

  if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true')
    console.log('🔑 Login inicial, armazenando tokens da conta', {
      hasAccessToken: !!account.access_token,
      hasRefreshToken: !!account.refresh_token,
      expiresAt: account.expires_at
    })

  return {
    ...token,
    access_token: account.access_token || '',
    expires_at: account.expires_at || now + JWT_CONSTANTS.DEFAULT_EXPIRY,
    refresh_token: account.refresh_token || ''
  }
}

/**
 * Processa trigger de atualização manual da sessão
 *
 * @param token - Token JWT atual
 * @returns Token JWT (pode ser modificado para lógica customizada)
 *
 * @private
 */
function handleManualUpdate(token: ExtendedJWT): ExtendedJWT {
  if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true')
    console.log('🔄 Atualização manual da sessão acionada')
  // Lógica customizada para atualizações manuais pode ser adicionada aqui
  return token
}

/**
 * Handler JWT principal do NextAuth
 *
 * Gerencia o ciclo de vida completo dos tokens JWT:
 * - Armazenamento inicial no login
 * - Renovação automática quando expirado
 * - Limpeza em caso de falha
 * - Suporte a triggers manuais
 *
 * @param props - Propriedades do callback JWT
 * @returns Token JWT atualizado ou com erro
 *
 * @example
 * ```typescript
 * // Uso automático pelo NextAuth
 * // Não é necessário chamar diretamente
 *
 * // O handler é chamado automaticamente em:
 * // - Login inicial
 * // - Renovação de tokens
 * // - Atualização manual de sessão
 * ```
 */
export async function jwtHandler({
  account,
  token,
  trigger
}: JwtHandlerProps): Promise<JWT> {
  // 1. Login inicial - armazenar tokens da conta OAuth
  if (account) {
    return handleInitialSignIn(token, account)
  }

  // 2. Trigger de atualização manual
  if (trigger === 'update') {
    return handleManualUpdate(token as ExtendedJWT)
  }

  const extendedToken = token as ExtendedJWT

  // 3. Verificar se token precisa ser renovado
  if (!shouldRefreshToken(extendedToken)) {
    return extendedToken
  }

  // 4. Token expirado ou prestes a expirar - tentar renovar
  if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true')
    console.log('⚠️ Token expirado ou prestes a expirar, tentando renovar', {
      currentTime: Math.floor(Date.now() / 1000),
      expiresAt: extendedToken.expires_at,
      hasRefreshToken: !!extendedToken.refresh_token
    })

  try {
    return await refreshAccessToken(extendedToken)
  } catch (error) {
    console.error('💥 Falha na renovação do token no jwtHandler:', error)

    // Em caso de falha crítica na renovação, retornar token com erro
    // Isso permite que a sessão continue mas com flag de erro
    return {
      ...extendedToken,
      error: JWT_CONSTANTS.REFRESH_ERROR,
      access_token: extendedToken.access_token,
      expires_at: extendedToken.expires_at,
      refresh_token: extendedToken.refresh_token
    }
  }
}
