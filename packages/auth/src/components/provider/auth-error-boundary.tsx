/**
 * @fileoverview Error Boundary para Autenticação
 *
 * Captura e trata erros relacionados à autenticação:
 * - Erros de configuração do NextAuth
 * - Falhas na renovação de tokens
 * - Problemas de conectividade
 * - Estados de erro da sessão
 */

'use client'

import React, { Component, type ReactNode } from 'react'

/**
 * Propriedades do AuthErrorBoundary
 */
interface AuthErrorBoundaryProps {
  /** Componentes filhos a serem renderizados */
  children: ReactNode
  /** Callback opcional para tratamento customizado de erros */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

/**
 * Estado do AuthErrorBoundary
 */
interface AuthErrorBoundaryState {
  /** Indica se ocorreu um erro */
  hasError: boolean
  /** O erro que ocorreu */
  error?: Error
}

/**
 * Error Boundary para Autenticação
 *
 * Captura erros relacionados à autenticação e fornece:
 * - Interface de erro amigável
 * - Opção de tentar novamente
 * - Logging detalhado de erros
 * - Recuperação graceful de estados de erro
 *
 * @example
 * ```tsx
 * <AuthErrorBoundary>
 *   <AuthProvider>
 *     <App />
 *   </AuthProvider>
 * </AuthErrorBoundary>
 * ```
 */
export class AuthErrorBoundary extends Component<
  AuthErrorBoundaryProps,
  AuthErrorBoundaryState
> {
  constructor(props: AuthErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): AuthErrorBoundaryState {
    console.error('💥 Erro capturado pelo AuthErrorBoundary:', error)
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('📋 Detalhes do erro de autenticação:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    })

    // Chamar callback customizado se fornecido
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  /**
   * Tenta recuperar do erro
   */
  handleRetry = () => {
    if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true')
      console.log('🔄 Tentando recuperar do erro de autenticação...')
    this.setState({ hasError: false, error: undefined })
  }

  /**
   * Redireciona para página de login
   */
  handleRedirectToLogin = () => {
    if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true')
      console.log('🔑 Redirecionando para login após erro crítico...')
    window.location.href = '/auth/signin'
  }

  render() {
    if (this.state.hasError) {
      const isAuthError =
        this.state.error?.message?.includes('auth') ||
        this.state.error?.message?.includes('token') ||
        this.state.error?.message?.includes('session')

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex flex-col items-center text-center">
              {/* Ícone de erro */}
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>

              {/* Título */}
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                {isAuthError ? 'Erro de Autenticação' : 'Erro na Aplicação'}
              </h1>

              {/* Descrição */}
              <p className="text-gray-600 mb-6">
                {isAuthError
                  ? 'Ocorreu um problema com a autenticação. Tente fazer login novamente.'
                  : 'Ocorreu um erro inesperado. Tente recarregar a página.'}
              </p>

              {/* Detalhes do erro (apenas em desenvolvimento) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="w-full mb-4">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                    Detalhes do erro
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {this.state.error.message}
                  </pre>
                </details>
              )}

              {/* Botões de ação */}
              <div className="flex gap-3">
                <button
                  onClick={this.handleRetry}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Tentar Novamente
                </button>

                {isAuthError && (
                  <button
                    onClick={this.handleRedirectToLogin}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Fazer Login
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
