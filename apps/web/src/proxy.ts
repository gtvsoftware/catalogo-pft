import { generateMiddleware } from '@terraviva/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function proxy(req: NextRequest) {
  const { middlewareFn } = await generateMiddleware()

  if (process.env.NEXT_PUBLIC_DISABLE_AUTH) {
    return NextResponse.next()
  }

  return middlewareFn(req as any)
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|auth|visualizar|favicon.ico|sitemap.xml|robots.txt|css).*)'
  ]
}
