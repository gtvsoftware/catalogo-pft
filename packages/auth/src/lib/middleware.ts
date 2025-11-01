import { type NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

import { cookiePrefix } from '../config/cookies'

/**
 * Propriedades para geração do middleware de autenticação
 */
export interface GenerateMiddlewareProps {
  /** Função opcional para verificação de permissões/roles */
  checkRoleFn?: () => Promise<boolean>
}

/**
 * Constantes para caminhos de autenticação
 */
const AUTH_PATHS = {
  SIGN_IN: '/auth/signin',
  SIGN_OUT: '/auth/signout',
  ERROR: '/auth/error',
  NOT_ALLOWED: '/not-allowed'
} as const

/**
 * Tipos de erro para redirecionamento
 */
const ERROR_TYPES = {
  JWT_DECRYPT: 'jwt-decrypt'
} as const

/**
 * Gera um middleware de autenticação configurável para Next.js
 *
 * Este middleware gerencia:
 * - Redirecionamento de usuários não autenticados
 * - Verificação de tokens JWT
 * - Controle de acesso baseado em roles (opcional)
 * - Tratamento de erros de autenticação
 *
 * As configurações são lidas automaticamente das variáveis de ambiente:
 * - NEXT_PUBLIC_APP_URL: URL base da aplicação (obrigatório)
 * - NEXT_PUBLIC_BASE_PATH: Caminho base da aplicação (opcional)
 * - AUTH_SECRET: Segredo para validação de tokens JWT (obrigatório)
 *
 * @param props - Propriedades de configuração do middleware
 * @returns Objeto contendo a função middleware configurada
 *
 * @example
 * ```typescript
 * const { middlewareFn } = generateMiddleware({
 *   checkRoleFn: async () => {
 *     // Lógica de verificação de roles
 *     return true
 *   }
 * })
 * ```
 */
export async function generateMiddleware({
  checkRoleFn
}: GenerateMiddlewareProps = {}) {
  // Lê configurações das variáveis de ambiente
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH
  const authSecret = process.env.AUTH_SECRET

  // Validação das variáveis de ambiente obrigatórias
  if (!appUrl) {
    throw new Error('Variável de ambiente NEXT_PUBLIC_APP_URL é obrigatória')
  }

  if (!authSecret) {
    throw new Error('Variável de ambiente AUTH_SECRET é obrigatória')
  }

  // Valida se APP_URL é uma URL válida
  try {
    new URL(appUrl)
  } catch {
    throw new Error('NEXT_PUBLIC_APP_URL não é uma URL válida')
  }

  /**
   * Redireciona usuário não autenticado para página de login
   */
  async function ensureAuthenticated(req: NextRequest): Promise<NextResponse> {
    const normalizeSlashes = (url: string) => {
      return url.replace(/([^:]\/)\/+/g, '$1') // Keep protocol slashes, fix others
    }

    const signInPath = basePath
      ? normalizeSlashes(`${appUrl}/${basePath}/${AUTH_PATHS.SIGN_IN}`)
      : normalizeSlashes(`${appUrl}/${AUTH_PATHS.SIGN_IN}`)

    const finalUrl = new URL(signInPath, appUrl)
    const response = NextResponse.redirect(finalUrl)

    // Preserva a URL original para redirecionamento após login
    response.headers.set('x-url', req.nextUrl.href)

    return response
  }

  /**
   * Verifica permissões/roles do usuário autenticado
   */
  async function checkRoles(): Promise<NextResponse> {
    if (!checkRoleFn) {
      return NextResponse.next()
    }

    try {
      const hasPermission = await checkRoleFn()

      if (!hasPermission) {
        const notAllowedPath = basePath
          ? `${basePath}${AUTH_PATHS.NOT_ALLOWED}`
          : AUTH_PATHS.NOT_ALLOWED

        const finalUrl = new URL(notAllowedPath, appUrl)
        return NextResponse.redirect(finalUrl)
      }

      return NextResponse.next()
    } catch (error) {
      console.error('Erro ao verificar roles:', error)
      // Em caso de erro na verificação, permite acesso (fail-safe)
      return NextResponse.next()
    }
  }

  /**
   * Verifica se a URL atual é uma URL de autenticação
   */
  function isAuthUrl(pathname: string): boolean {
    if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true')
      console.log('pathname', pathname)

    const authPaths = [
      AUTH_PATHS.SIGN_IN,
      AUTH_PATHS.SIGN_OUT,
      AUTH_PATHS.ERROR,
      AUTH_PATHS.NOT_ALLOWED
    ]

    return authPaths.some(path =>
      basePath ? pathname === `${basePath}${path}` : pathname === path
    )
  }

  /**
   * Função principal do middleware
   */
  async function middlewareFn(req: NextRequest): Promise<NextResponse> {
    const { pathname } = req.nextUrl
    const isAuthPath = isAuthUrl(pathname)
    const isNotAllowedPath = basePath
      ? pathname === `${basePath}${AUTH_PATHS.NOT_ALLOWED}`
      : pathname === AUTH_PATHS.NOT_ALLOWED

    // Busca token de sessão nos cookies
    const cookies = req.cookies.getAll()
    const sessionCookieName = `${cookiePrefix}next-auth.session-token`
    const hasSessionCookie = cookies.some(cookie =>
      cookie.name.includes(sessionCookieName)
    )

    // Valida token JWT
    const token = await getToken({
      req,
      secret: authSecret,
      cookieName: sessionCookieName
    })

    // Caso 1: Cookie de sessão existe mas token é inválido
    if (hasSessionCookie && !token && !isAuthPath) {
      const errorUrl = new URL(
        `${AUTH_PATHS.ERROR}?type=${ERROR_TYPES.JWT_DECRYPT}`,
        appUrl
      )
      return NextResponse.redirect(errorUrl)
    }

    // Caso 2: Usuário autenticado
    if (token) {
      // Se não está em página de erro ou não permitido, verifica roles
      if (!isNotAllowedPath && !isAuthPath) {
        return await checkRoles()
      }

      // Preserva URL original nos headers
      const requestHeaders = new Headers(req.headers)
      requestHeaders.set('x-url', req.nextUrl.href)

      return NextResponse.next({
        request: { headers: requestHeaders }
      })
    }

    // Caso 3: Usuário não autenticado
    if (!token && !isAuthPath) {
      return await ensureAuthenticated(req)
    }

    // Caso 4: URLs de autenticação ou usuário autenticado em página de auth
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-url', req.nextUrl.href)

    return NextResponse.next({
      request: { headers: requestHeaders }
    })
  }

  return { middlewareFn }
}

/**
 * Configuração do matcher para o middleware
 *
 * Exclui caminhos que não precisam de autenticação:
 * - API routes (/api/*)
 * - Assets estáticos (/_next/static/*)
 * - Imagens otimizadas (/_next/image/*)
 * - Arquivos de metadata (favicon.ico, sitemap.xml, etc.)
 */
export const middlewareConfig = {
  matcher: [
    /*
     * Corresponde a todos os caminhos de requisição exceto aqueles que começam com:
     * - api (rotas da API)
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagens)
     * - favicon.ico, sitemap.xml, robots.txt (arquivos de metadata)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|css).*)'
  ]
}
