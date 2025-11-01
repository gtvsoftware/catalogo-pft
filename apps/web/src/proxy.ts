import { generateMiddleware } from '@terraviva/auth'
import { NextRequest } from 'next/server'

export async function proxy(req: NextRequest) {
  const { middlewareFn } = await generateMiddleware()

  return middlewareFn(req as any)
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|css).*)'
  ]
}
