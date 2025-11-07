import { ThemeProvider } from '@terraviva/ui/providers'
import type { Metadata } from 'next'

import { APP_CONFIG } from '@/config/app.config'

export default async function RootLayout({
  children
}: React.PropsWithChildren) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="font-sans w-full">
        {/* <TerraVivaAuthProvider> */}
        <ThemeProvider>{children}</ThemeProvider>
        {/* </TerraVivaAuthProvider> */}
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  title: APP_CONFIG.APP_TITLE,
  description: APP_CONFIG.APP_DESCRIPTION
}
