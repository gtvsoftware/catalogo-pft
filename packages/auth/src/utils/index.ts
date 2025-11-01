/**
 * Utilitários diversos para o sistema de autenticação
 *
 * Este módulo exporta todas as funções utilitárias disponíveis,
 * incluindo validação de domínios, status de sessão, renovação de tokens
 * e configurações de URLs.
 */

// Criador de instância Axios com autenticação
export {
  type CreateAxiosInstanceConfig,
  createAxiosInstance,
  useAxiosInstance
} from './createAxiosInstance'
// Utilitários de domínio
export { getDomainWithoutSubdomain } from './getDomainWithoutSubdomain'
// Utilitários de sessão
export { getSessionStatus } from './getSessionStatus'
// Type exports for documentation
export type { GetTokenFromIssuerProps } from './getTokenFromIssuer'
// Utilitários de token
export { getTokenFromIssuer } from './getTokenFromIssuer'
// Configurações de URL
export {
  appUrlFromEnv,
  authUrlFromEnv,
  basePathFromEnv,
  fullUrlFromEnv
} from './urls'
