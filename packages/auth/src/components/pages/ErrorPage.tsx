/**
 * @fileoverview Página de erro de autenticação
 *
 * Exibe páginas de erro customizadas para diferentes tipos de falha de autenticação:
 * - Erro de decodificação JWT
 * - Erros genéricos de autenticação
 * - Interface responsiva e acessível
 */

/**
 * Propriedades para as páginas de erro de autenticação
 */
export interface PageProps {
  searchParams: {
    type?: 'jwt-decrypt' | string
  }
}

/**
 * Propriedades para o componente de erro genérico
 */
interface ErrorScreenProps {
  /** Título da página de erro */
  title: string
  /** Mensagem descritiva do erro */
  message: string
  /** Código do erro para debugging */
  code?: string
  /** Texto do botão de ação */
  hrefTitle?: string
  /** URL para redirecionamento */
  href?: string
  /** Cor do tema (warning, error, info) */
  color?: 'warning' | 'error' | 'info'
}

/**
 * Componente de tela de erro genérica
 *
 * Fornece uma interface consistente para exibir erros de autenticação
 * com ícones, mensagens e ações customizáveis.
 */
function ErrorScreen({
  title,
  message,
  code,
  hrefTitle = 'Voltar ao portal',
  href = '/',
  color = 'warning'
}: ErrorScreenProps) {
  // Definir cores baseado no tipo
  const colorClasses = {
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'text-yellow-600',
      button: 'bg-yellow-600 hover:bg-yellow-700'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700'
    }
  }

  const colors = colorClasses[color]

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${colors.bg} py-12 px-4 sm:px-6 lg:px-8`}
    >
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Ícone de cadeado */}
          <div className={`mx-auto h-16 w-16 ${colors.icon} mb-4`}>
            <svg
              className="h-full w-full"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          {/* Título */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>

          {/* Mensagem */}
          <p className="text-gray-600 mb-6">{message}</p>

          {/* Código do erro (apenas em desenvolvimento) */}
          {code && process.env.NODE_ENV === 'development' && (
            <div className="bg-gray-100 border border-gray-300 rounded-md p-3 mb-6">
              <p className="text-sm text-gray-700">
                <strong>Código do erro:</strong> {code}
              </p>
            </div>
          )}

          {/* Botão de ação */}
          {hrefTitle && (
            <div>
              <a
                href={href}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${colors.button} transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${color === 'warning' ? 'yellow' : color === 'error' ? 'red' : 'blue'}-500`}
              >
                {hrefTitle}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Página de erro de autenticação
 *
 * Renderiza diferentes tipos de erro baseado no parâmetro de busca:
 * - jwt-decrypt: Erro específico de decodificação JWT
 * - default: Erro genérico de autenticação
 *
 * @param props - Propriedades da página
 * @returns Componente de erro apropriado
 *
 * @example
 * ```tsx
 * // URL: /auth/error?type=jwt-decrypt
 * <AuthErrorPage searchParams={{ type: 'jwt-decrypt' }} />
 * ```
 */
export function AuthErrorPage({ searchParams }: PageProps) {
  switch (searchParams.type) {
    case 'jwt-decrypt':
      return (
        <ErrorScreen
          title="Erro na autenticação"
          message="Houve um problema ao recuperar sua sessão. Tente fazer login novamente."
          code="jwt-decrypt"
          hrefTitle="Fazer Login"
          href="/auth/signin"
          color="warning"
        />
      )

    case 'session-expired':
      return (
        <ErrorScreen
          title="Sessão expirada"
          message="Sua sessão expirou por inatividade. Faça login novamente para continuar."
          code="session-expired"
          hrefTitle="Fazer Login"
          href="/auth/signin"
          color="info"
        />
      )

    case 'access-denied':
      return (
        <ErrorScreen
          title="Acesso negado"
          message="Você não tem permissão para acessar este recurso."
          code="access-denied"
          hrefTitle="Voltar ao início"
          href="/"
          color="error"
        />
      )

    default:
      return (
        <ErrorScreen
          title="Erro na autenticação"
          message="Houve um problema desconhecido com a autenticação. Tente novamente ou entre em contato com o suporte."
          hrefTitle="Voltar ao portal"
          href="/"
          color="warning"
        />
      )
  }
}
