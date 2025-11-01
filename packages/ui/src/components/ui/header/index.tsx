import { cn } from '@terraviva/ui/cn'
import {
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@terraviva/ui/dropdown-menu'
import { AppConfigProps } from '../../../types/app.config'
import { Button } from '../button'
import { Icon } from '../icon'
import { HeaderBrand } from './brand'
import { AppsDropdownMenu } from './dropdown'
import { NavItems } from './navbar'
import { DropdownProvider } from './navbar/components/dropdownProvider'
import { HeaderDropdownContent } from './navbar/components/headerDropdownContent'
import { UserAction } from './userAction'

interface HeaderProps {
  appConfig: AppConfigProps
  className?: string
  rightArea?: React.ReactNode
}

export async function Header({
  rightArea,
  appConfig,
  className
}: HeaderProps) {
  const menuItems = appConfig?.NAVBAR_ITEMS
    ? await appConfig.NAVBAR_ITEMS()
    : []

  const appsList = appConfig?.APP_LIST_ITEMS
    ? await appConfig.APP_LIST_ITEMS(appConfig.environment)
    : []

  return (
    <DropdownProvider>
      <nav
        className={cn(
          'flex items-center justify-center',
          'w-full py-2 bg-background min-h-12',
          'border-b border-border z-50 mb-2'
        )}
      >
        <div
          className={cn(
            'w-full flex items-center justify-between px-4 md:px-8',
            className
          )}
        >
          <div className="flex items-center gap-2">
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="rounded-xl w-9 h-9 cursor-pointer lg:hidden"
              >
                <Icon icon="bars" className="text-neutral-500" />
              </Button>
            </DropdownMenuTrigger>
            <div className="flex gap-2 items-center">
              <HeaderBrand appConfig={appConfig} />
              <NavItems menuItems={menuItems} />
            </div>
          </div>

          <div className="flex gap-4 items-center">
            {rightArea && rightArea}
            {appsList && <AppsDropdownMenu appConfig={appConfig} />}
            <UserAction appConfig={appConfig} />
          </div>
        </div>
      </nav>
      <DropdownMenuContent
        side="bottom"
        className="max-w-none w-[calc(100vw-16px)] mt-4 mx-2 h-[calc(100vh-72px)] overflow-y-scroll"
      >
        <HeaderDropdownContent menuItems={menuItems} />
      </DropdownMenuContent>
    </DropdownProvider>
  )
}
