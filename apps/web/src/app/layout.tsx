import { TerraVivaAuthProvider } from '@terraviva/auth'
import { TerraVivaUiProvider } from '@terraviva/ui/providers'
import type { Metadata } from 'next'

import { APP_CONFIG } from '@/config/app.config'

export default async function RootLayout({
  children
}: React.PropsWithChildren) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="font-sans">
        <TerraVivaAuthProvider>
          <TerraVivaUiProvider appConfig={APP_CONFIG}>
            {children}
          </TerraVivaUiProvider>
        </TerraVivaAuthProvider>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  title: APP_CONFIG.APP_TITLE,
  description: APP_CONFIG.APP_DESCRIPTION
}
