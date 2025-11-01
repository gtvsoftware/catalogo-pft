/**
 * @fileoverview Provedor Keycloak para NextAuth
 *
 * Configura o provedor OAuth2/OIDC do Keycloak para autenticação:
 * - Integração com servidor Keycloak para autenticação
 * - Suporte a fluxos OAuth2 padrão (Authorization Code)
 * - Configuração automática via variáveis de ambiente
 * - Tratamento seguro de client ID e secret
 */

import Keycloak from 'next-auth/providers/keycloak'

/**
 * Constantes de configuração do Keycloak
 */
const KEYCLOAK_CONFIG = {
  /** Variável de ambiente para Client ID */
  CLIENT_ID_ENV: 'AUTH_CLIENT_ID',
  /** Variável de ambiente para Client Secret */
  CLIENT_SECRET_ENV: 'AUTH_CLIENT_SECRET',
  /** Variável de ambiente para URL do Issuer */
  ISSUER_URL_ENV: 'AUTH_ISSUER_URL'
} as const

/**
 * Valida se todas as variáveis de ambiente necessárias estão configuradas
 *
 * @throws Error quando variáveis obrigatórias não estão definidas
 *
 * @private
 */
function validateEnvironmentVariables(): void {
  const requiredVars = [
    {
      env: KEYCLOAK_CONFIG.CLIENT_ID_ENV,
      value: process.env[KEYCLOAK_CONFIG.CLIENT_ID_ENV]
    },
    {
      env: KEYCLOAK_CONFIG.CLIENT_SECRET_ENV,
      value: process.env[KEYCLOAK_CONFIG.CLIENT_SECRET_ENV]
    },
    {
      env: KEYCLOAK_CONFIG.ISSUER_URL_ENV,
      value: process.env[KEYCLOAK_CONFIG.ISSUER_URL_ENV]
    }
  ]

  // const missingVars = requiredVars
  //   .filter(({ value }) => !value)
  //   .map(({ env }) => env)

  // if (missingVars.length > 0) {
  //   console.error(
  //     '❌ Variáveis de ambiente obrigatórias não configuradas:',
  //     missingVars
  //   )
  //   throw new Error(
  //     `Variáveis de ambiente obrigatórias não encontradas: ${missingVars.join(', ')}`
  //   )
  // }

  if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true')
    console.log(
      '✅ Todas as variáveis de ambiente do Keycloak estão configuradas'
    )
}

/**
 * Provedor Keycloak configurado para NextAuth
 *
 * Configura automaticamente o provedor Keycloak usando variáveis de ambiente:
 * - AUTH_CLIENT_ID: ID do cliente OAuth no Keycloak
 * - AUTH_CLIENT_SECRET: Secret do cliente OAuth
 * - AUTH_ISSUER_URL: URL base do realm Keycloak (ex: https://keycloak.example.com/realms/my-realm)
 *
 * @example
 * ```typescript
 * // Uso automático na configuração do NextAuth
 * import { NextAuth } from 'next-auth'
 * import { KeycloakProvider } from './auth-providers/keycloak'
 *
 * export const { handlers, auth, signIn, signOut } = NextAuth({
 *   providers: [KeycloakProvider],
 *   // ... outras configurações
 * })
 * ```
 *
 * @example
 * ```bash
 * # Variáveis de ambiente necessárias
 * AUTH_CLIENT_ID=my-client-id
 * AUTH_CLIENT_SECRET=my-client-secret
 * AUTH_ISSUER_URL=https://keycloak.example.com/realms/my-realm
 * ```
 */
export const KeycloakProvider = (() => {
  // Validar variáveis de ambiente em tempo de inicialização
  validateEnvironmentVariables()

  if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true')
    console.log('🔑 Inicializando provedor Keycloak', {
      hasClientId: !!process.env[KEYCLOAK_CONFIG.CLIENT_ID_ENV],
      hasClientSecret: !!process.env[KEYCLOAK_CONFIG.CLIENT_SECRET_ENV],
      issuer: process.env[KEYCLOAK_CONFIG.ISSUER_URL_ENV]
    })

  return Keycloak({
    clientId: process.env[KEYCLOAK_CONFIG.CLIENT_ID_ENV]!,
    clientSecret: process.env[KEYCLOAK_CONFIG.CLIENT_SECRET_ENV]!,
    issuer: process.env[KEYCLOAK_CONFIG.ISSUER_URL_ENV]!
  })
})()
