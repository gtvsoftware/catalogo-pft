import { AuthProvider } from '@terraviva/auth'
import { ThemeProvider } from '@terraviva/ui/providers'
import type { Metadata } from 'next'

import { APP_CONFIG } from '@/config/app.config'

export default async function RootLayout({
  children
}: React.PropsWithChildren) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, viewport-fit=cover"
      />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta
        name="apple-mobile-web-app-status-bar-style"
        content="black-translucent"
      />
      <body className="font-sans w-full">
        {process.env.NEXT_PUBLIC_DISABLE_AUTH ? (
          <ThemeProvider>{children}</ThemeProvider>
        ) : (
          <AuthProvider publicPaths={['/visualizar']}>
            <ThemeProvider>{children}</ThemeProvider>
          </AuthProvider>
        )}
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  title: APP_CONFIG.APP_TITLE,
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover'
  },
  themeColor: '#ffffff',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default'
  }
}
