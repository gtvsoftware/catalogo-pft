/**
 * @fileoverview Configuração principal do NextAuth para autenticação com Keycloak
 *
 * Este arquivo configura o NextAuth.js com:
 * - Provedor Keycloak para autenticação OAuth2/OIDC
 * - Gerenciamento de cookies seguros
 * - Callbacks para JWT e sessão
 * - Refresh automático de tokens
 *
 * @requires NEXT_PUBLIC_APP_URL - URL base da aplicação
 * @requires AUTH_URL - URL do servidor de autenticação
 * @requires AUTH_CLIENT_ID - ID do cliente OAuth
 * @requires AUTH_CLIENT_SECRET - Segredo do cliente OAuth
 * @requires AUTH_ISSUER_URL - URL do issuer OIDC
 */

import NextAuth from 'next-auth'

import { cookies, useSecureCookies } from '../config/cookies'
import { KeycloakProvider } from './auth-providers/keycloak'
import { jwtHandler } from './handlers/jwt'
import { sessionHandler } from './handlers/session'

/**
 * Configuração do NextAuth
 *
 * Define todas as opções necessárias para autenticação:
 * - Provedores de autenticação (Keycloak)
 * - Configuração de cookies
 * - Callbacks para JWT e sessão
 * - Configurações de segurança
 */
const nextAuthConfig = {
  /**
   * Configuração de confiança do host
   * Em produção, deve ser true para maior segurança
   */
  trustHost: true,

  /**
   * Provedores de autenticação
   * Atualmente configurado apenas com Keycloak
   */
  providers: [KeycloakProvider],

  /**
   * Configuração de cookies
   * Usa cookies seguros em produção e cookies normais em desenvolvimento
   */
  cookies,
  useSecureCookies,

  /**
   * Callbacks do NextAuth
   * Gerenciam o ciclo de vida dos tokens JWT e sessões
   */
  callbacks: {
    /**
     * Callback JWT - gerencia tokens de acesso e refresh
     * Executado em cada requisição que envolve autenticação
     */
    jwt: jwtHandler as any,

    /**
     * Callback de sessão - configura dados da sessão do usuário
     * Executado quando uma sessão é criada ou atualizada
     */
    session: sessionHandler,

    /**
     * Callback de autorização - verifica se usuário está autorizado
     * Usado pelo middleware para controle de acesso
     */
    authorized: async ({ auth }: { auth: any }) => {
      // Usuários logados são considerados autenticados
      // Caso contrário, redireciona para página de login
      return !!auth
    }
  }
}

/**
 * Inicialização do NextAuth com configuração completa
 *
 * Cria e exporta todas as funções necessárias:
 * - handlers: Para rotas da API (/api/auth/*)
 * - signIn: Função para iniciar autenticação
 * - signOut: Função para encerrar sessão
 * - auth: Função principal para obter dados de autenticação
 */
export const { handlers, signIn, signOut, auth } = NextAuth(nextAuthConfig)

/**
 * Exportações nomeadas para uso em outros módulos
 *
 * @example
 * ```typescript
 * import { auth } from '@/lib/auth'
 *
 * // Verificar sessão atual
 * const session = await auth()
 *
 * // Usar em componente React
 * import { signIn, signOut } from '@/lib/auth'
 * ```
 */
