import { DashboardProvider } from '@terraviva/ui/providers'
import type { Metadata } from 'next'

import { APP_CONFIG } from '@/config/app.config'

export default async function DashboardLayout({
  children
}: React.PropsWithChildren) {
  return (
    <DashboardProvider appConfig={APP_CONFIG}>{children}</DashboardProvider>
  )
}

export const metadata: Metadata = {
  title: APP_CONFIG.APP_TITLE
}
