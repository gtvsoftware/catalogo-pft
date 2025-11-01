/**
 * @fileoverview Provider NextAuth.js Client-Side
 *
 * Configura o SessionProvider do NextAuth no lado cliente:
 * - Base path correto para rotas da API
 * - Configurações de refetch otimizadas
 * - Suporte a offline e foco na janela
 * - Logging detalhado para debugging
 */

import { SessionProvider as Provider } from 'next-auth/react'
import React from 'react'

import { fullUrlFromEnv } from '../../utils/urls'

/**
 * Propriedades do AuthJsProvider
 */
export interface AuthJsProviderProps extends React.PropsWithChildren<any> {}

/**
 * Provider NextAuth.js para o lado cliente
 *
 * Configura o SessionProvider com:
 * - Base path correto baseado na URL da aplicação
 * - Refetch inteligente (60s, offline, foco na janela)
 * - Suporte robusto a diferentes ambientes
 *
 * @param props - Propriedades do provider
 * @returns Provider NextAuth configurado
 *
 * @example
 * ```tsx
 * <AuthJsProvider>
 *   <App />
 * </AuthJsProvider>
 * ```
 */
export const AuthJsProvider = ({
  children
}: AuthJsProviderProps): React.ReactElement => {
  // Garantir que a URL termine com / para construção correta do basePath
  const baseUrl = fullUrlFromEnv.endsWith('/')
    ? fullUrlFromEnv
    : fullUrlFromEnv + '/'

  const basePath = baseUrl + 'api/auth'

  if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true')
    console.log('🔧 Configurando AuthJsProvider:', {
      baseUrl,
      basePath,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : 'unknown'
    })

  return (
    <Provider
      basePath={basePath}
      refetchInterval={60} // Refetch a cada 60 segundos
      refetchWhenOffline={false} // Não refetch quando offline
      refetchOnWindowFocus={
        // Só refetch no foco da janela se estiver online
        typeof navigator !== 'undefined' && navigator.onLine
      }
    >
      {children}
    </Provider>
  )
}
