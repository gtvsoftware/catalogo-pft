/**
 * @fileoverview Provider de Sessão Client-Side
 *
 * Gerencia o estado da sessão no lado cliente:
 * - Redirecionamento automático para login quando não autenticado
 * - Tratamento de erros de refresh de token
 * - Estados de loading durante verificação de autenticação
 * - Callback URL para redirecionamento após login
 */

'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { type ReactElement, useEffect, useState } from 'react'

import { useAuthSession } from '../../hooks/use-auth-session'
import { fullUrlFromEnv } from '../../utils/urls'

/**
 * Propriedades do SessionProvider
 */
export interface SessionProviderProps {
  /** Componentes filhos a serem renderizados */
  children: React.ReactNode
}

/**
 * Provider de Sessão Client-Side
 *
 * Gerencia automaticamente:
 * - Redirecionamento para login quando sessão expira
 * - Tratamento de erros de refresh de token
 * - Estados de loading durante autenticação
 * - Preservação da URL atual para callback após login
 *
 * @param props - Propriedades do provider
 * @returns Elemento React com sessão gerenciada
 *
 * @example
 * ```tsx
 * <SessionProvider>
 *   <MyApp />
 * </SessionProvider>
 * ```
 */
export function SessionProvider({
  children
}: SessionProviderProps): ReactElement {
  const pathname = usePathname()
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Usar hook personalizado para melhor gerenciamento de sessão
  const {
    data: session,
    status,
    isTokenExpired,
    hasRefreshError,
    isSessionHealthy
  } = useAuthSession()

  const origin = fullUrlFromEnv
  const path = pathname
  const callbackUrl = `${origin}${path}`

  /**
   * Redireciona para página de login com callback URL
   */
  const handleRedirect = (): void => {
    if (pathname !== '/auth/signin' && !isRedirecting) {
      setIsRedirecting(true)
      if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true')
        console.log('🔄 Redirecionando para login:', { callbackUrl })
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`)
    }
  }

  useSession({
    required: true,
    async onUnauthenticated() {
      if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true')
        console.log('🚫 Usuário não autenticado, redirecionando...')
      handleRedirect()
    }
  })

  // Verificar se há erro de sessão ou token expirado
  const hasSessionError = session?.error === 'SESSION_CONFIG_ERROR'
  const needsSignIn =
    status === 'authenticated' &&
    (!isSessionHealthy() ||
      hasRefreshError() ||
      hasSessionError ||
      isTokenExpired())

  useEffect(() => {
    if (needsSignIn && !isRedirecting) {
      console.warn('⚠️ Problema de autenticação detectado:', {
        hasRefreshError: hasRefreshError(),
        hasSessionError,
        isTokenExpired: isTokenExpired(),
        isSessionHealthy: isSessionHealthy()
      })
      handleRedirect()
    }
  }, [needsSignIn, isRedirecting])

  // Reset redirecting flag when pathname changes
  useEffect(() => {
    if (pathname !== '/auth/signin') {
      setIsRedirecting(false)
    }
  }, [pathname])

  // Mostrar loading enquanto verifica sessão
  // if (status === 'loading') {
  //   return (
  //     <div className="relative flex flex-col min-h-svh min-w-full items-center justify-center">
  //       <div className="flex flex-col items-center gap-4">
  //         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  //         <p className="text-sm text-gray-600">Verificando autenticação...</p>
  //       </div>
  //     </div>
  //   )
  // }

  // Mostrar erro se houver problema crítico
  // if (hasRefreshError() || hasSessionError) {
  //   return (
  //     <div className="relative flex flex-col min-h-svh min-w-full items-center justify-center">
  //       <div className="flex flex-col items-center gap-4 max-w-md text-center">
  //         <div className="text-red-500 text-6xl">⚠️</div>
  //         <h2 className="text-xl font-semibold text-gray-900">
  //           Sessão Expirada
  //         </h2>
  //         <p className="text-gray-600">
  //           Sua sessão expirou. Você será redirecionado para fazer login
  //           novamente.
  //         </p>
  //         <button
  //           onClick={handleRedirect}
  //           className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
  //         >
  //           Fazer Login
  //         </button>
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <div className="relative flex flex-col min-h-svh min-w-full">
      {children}
    </div>
  )
}
