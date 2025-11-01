import type { AppConfigProps } from "../types"
import { DashboardProvider } from "./dashboard.provider"
import { ThemeProvider } from "./theme.provider"

interface AppProviderProps extends React.PropsWithChildren {
  appConfig: AppConfigProps
}

export function TerraVivaUiProvider({ children, appConfig }: AppProviderProps) {
  return (
    <ThemeProvider>
      <DashboardProvider appConfig={appConfig}>
        {children}
      </DashboardProvider>
    </ThemeProvider>
  )
}
  