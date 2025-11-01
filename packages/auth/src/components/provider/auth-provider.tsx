/**
 * @file Provider de Autenticação Principal
 *
 * Combina os providers de autenticação em uma estrutura hierárquica:
 * - AuthJsProvider: Configuração NextAuth client-side
 * - SessionProvider: Gerenciamento de sessão e redirecionamentos
 * - Tratamento de erros e estados de loading
 * - Estrutura organizada para aplicações React
 */

import React from 'react'

import { AuthErrorBoundary } from './auth-error-boundary'
import { AuthJsProvider } from './auth-js.provider'
import { SessionProvider } from './session.client.provider'

/**
 * Propriedades do AuthProvider
 */
export interface AuthProviderProps extends React.PropsWithChildren {}

/**
 * Provider de Autenticação Principal
 *
 * Estrutura hierárquica de providers com tratamento de erros e loading:
 * 1. AuthErrorBoundary - Captura erros de autenticação
 * 2. AuthJsProvider - Configuração NextAuth client-side
 * 3. SessionProvider - Gerenciamento de sessão e estados
 *
 * Garante que a autenticação esteja disponível em toda a aplicação
 * com tratamento adequado de erros, estados de loading e recuperação graceful.
 *
 * @param props - Propriedades do provider
 * @returns Providers de autenticação configurados com error boundary
 *
 * @example
 * ```tsx
 * // No arquivo raiz da aplicação (layout.tsx ou _app.tsx)
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * ```
 *
 * @example
 * ```tsx
 * // Com callback customizado de erro
 * <AuthProvider>
 *   <AuthErrorBoundary onError={(error, info) => {
 *     // Log para serviço de monitoramento
 *     console.error('Auth error:', error, info)
 *   }}>
 *     <App />
 *   </AuthErrorBoundary>
 * </AuthProvider>
 * ```
 *
 * @example
 * ```tsx
 * // Com loading state customizado
 * <AuthProvider>
 *   <AuthErrorBoundary
 *     fallback={
 *       <div className="loading-custom">
 *         <Spinner />
 *         <p>Carregando autenticação...</p>
 *       </div>
 *     }
 *   >
 *     <App />
 *   </AuthErrorBoundary>
 * </AuthProvider>
 * ```
 */
export function TerraVivaAuthProvider({ children }: AuthProviderProps) {
  if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true')
    console.log('🚀 Inicializando AuthProvider')

  return (
    <AuthErrorBoundary>
      <AuthJsProvider>
        <SessionProvider>{children}</SessionProvider>
      </AuthJsProvider>
    </AuthErrorBoundary>
  )
}
