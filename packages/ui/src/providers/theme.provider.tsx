
import '../styles/globals.css'
import '../styles/font-awesome/all.css';

import { Toaster } from '../components/ui/sonner'
import { ThemeProvider as NextThemeProvider } from 'next-themes'

export const ThemeProvider = ({ children }: React.PropsWithChildren) => {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="light"
      forcedTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
      <Toaster position="top-right" richColors />
    </NextThemeProvider>
  )
}