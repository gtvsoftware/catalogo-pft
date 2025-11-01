import { auth } from '@terraviva/auth'
import { Avatar, AvatarFallback, AvatarImage } from '@terraviva/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@terraviva/ui/dropdown-menu'
import { Icon } from '@terraviva/ui/icon'
import Link from 'next/link'

import { AppConfigProps } from '../../../../types/app.config'

interface UserActionProps {
  appConfig: AppConfigProps
}

export async function UserAction({
  appConfig
}: UserActionProps): Promise<React.ReactElement> {
  const session = await auth()

  const userMenuItems = appConfig?.APP_USER_MENU_ITEMS
    ? await appConfig.APP_USER_MENU_ITEMS()
    : []

  const getImageSource = (src?: string | null): string | undefined => {
    if (src !== null && src !== undefined) {
      return appConfig.AVATARS_URL + `${src}`
    }
    return undefined
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="z-50">
        <div className="flex items-center gap-2 h-max">
          <Avatar className="select-none cursor-pointer h-8 w-8">
            <AvatarImage
              style={{
                objectFit: 'cover'
              }}
              src={getImageSource(session?.user?.picture)}
            />
            <AvatarFallback className="bg-neutral-300">
              <Icon icon="user" />
            </AvatarFallback>
          </Avatar>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 p-2 rounded-2xl shadow-md"
      >
        <DropdownMenuLabel className="flex flex-col !font-regular">
          <span>Conectado como</span>
          <span className="font-normal">
            {session?.user?.name ?? 'Usuário não identificado'}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {userMenuItems.map(item => (
            <Link href={item.href} key={item.key}>
              <DropdownMenuItem className="cursor-pointer">
                <Icon icon={item.icon} className="mr-2" />
                <span> {item.label}</span>
              </DropdownMenuItem>
            </Link>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
