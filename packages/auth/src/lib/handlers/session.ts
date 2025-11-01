/**
 * @fileoverview Handler de Sessão para NextAuth
 *
 * Gerencia a configuração dos dados da sessão do usuário:
 * - Decodificação de tokens JWT para dados do usuário
 * - Mapeamento de propriedades customizadas da sessão
 * - Tratamento de erros de autenticação
 * - Suporte a refresh tokens e access tokens
 */

import { jwtDecode } from 'jwt-decode'
import { type Session, type User } from 'next-auth'
import { type JWT } from 'next-auth/jwt'

/**
 * Propriedades do handler de sessão do NextAuth
 */
interface SessionHandlerProps {
  /** Sessão atual do usuário */
  session: Session
  /** Token JWT com dados de autenticação */
  token: JWT
}

/**
 * Token JWT estendido com propriedades customizadas
 */
interface ExtendedJWT extends Omit<JWT, 'error'> {
  /** Token de acesso OAuth */
  access_token?: string
  /** Token de refresh OAuth */
  refresh_token?: string
  /** Flag de erro */
  error?: string
}

/**
 * Decodifica o token de acesso e extrai dados do usuário
 *
 * @param accessToken - Token JWT de acesso
 * @returns Dados do usuário decodificados do token
 * @throws Error quando o token é inválido ou não pode ser decodificado
 *
 * @private
 */
function decodeUserFromToken(accessToken: string): User {
  try {
    if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true')
      console.log('🔍 Decodificando token de acesso para dados do usuário')

    const decodedToken = jwtDecode(accessToken) as User

    if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true')
      console.log('✅ Token decodificado com sucesso', {
        hasSub: !!decodedToken.sub,
        hasEmail: !!decodedToken.email,
        hasName: !!decodedToken.name
      })

    return decodedToken
  } catch (error) {
    console.error('❌ Falha ao decodificar token:', error)

    const errorMessage =
      error instanceof Error ? error.message : 'Erro desconhecido'
    throw new Error(
      `Não foi possível decodificar o token de acesso: ${errorMessage}`
    )
  }
}

/**
 * Configura propriedades customizadas da sessão
 *
 * @param session - Sessão a ser configurada
 * @param token - Token com dados para configuração
 * @returns Sessão configurada com propriedades customizadas
 *
 * @private
 */
function configureSessionProperties(
  session: Session,
  token: ExtendedJWT
): Session {
  // Configurar dados do usuário
  if (token.access_token) {
    try {
      const userData = decodeUserFromToken(token.access_token)
      session.user = {
        ...session.user,
        ...userData
      }
    } catch (error) {
      console.warn(
        '⚠️ Não foi possível decodificar dados do usuário do token:',
        error
      )
      // Manter dados existentes da sessão em caso de erro
    }
  }

  // Configurar tokens
  if (token.refresh_token) {
    session.refresh_token = token.refresh_token
  }
  if (token.access_token) {
    session.access_token = token.access_token
  }
  if (token.error) {
    session.error = token.error
  }

  if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true')
    console.log('📝 Sessão configurada', {
      hasUser: !!session.user,
      hasAccessToken: !!session.access_token,
      hasRefreshToken: !!session.refresh_token,
      hasError: !!session.error
    })

  return session
}

/**
 * Handler de sessão principal do NextAuth
 *
 * Configura os dados da sessão do usuário baseados no token JWT:
 * - Decodifica dados do usuário do token de acesso
 * - Mapeia propriedades customizadas da sessão
 * - Trata erros de autenticação
 * - Configura tokens para uso no cliente
 *
 * @param props - Propriedades do callback de sessão
 * @returns Sessão configurada com dados do usuário e tokens
 *
 * @example
 * ```typescript
 * // Uso automático pelo NextAuth
 * // Não é necessário chamar diretamente
 *
 * // O handler é chamado automaticamente quando:
 * // - Uma sessão é criada ou atualizada
 * // - Dados do usuário precisam ser sincronizados
 * // - Tokens precisam ser expostos para o cliente
 * ```
 */
export async function sessionHandler({
  session,
  token
}: SessionHandlerProps): Promise<Session> {
  if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true')
    console.log('🔄 Configurando sessão do usuário', {
      hasToken: !!token,
      hasAccessToken: !!(token as ExtendedJWT).access_token
    })

  const extendedToken = token as ExtendedJWT

  // Verificar se há token de acesso para decodificar
  if (!extendedToken.access_token) {
    console.warn('⚠️ Nenhum token de acesso disponível para decodificação')
    return session
  }

  try {
    return configureSessionProperties(session, extendedToken)
  } catch (error) {
    console.error('💥 Erro ao configurar sessão:', error)

    // Retornar sessão com flag de erro em caso de falha crítica
    return {
      ...session,
      error: 'SESSION_CONFIG_ERROR'
    }
  }
}
