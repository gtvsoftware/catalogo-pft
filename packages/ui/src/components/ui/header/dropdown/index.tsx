import { Button } from '@terraviva/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@terraviva/ui/dropdown-menu'
import Image, { StaticImageData } from 'next/image'
import { Icon } from '../../icon'
import Link from 'next/link'
import { AppConfigProps } from '@/types'
import { getAppsList } from './items'

export type DrawerApp = {
  label: string
  icon: StaticImageData
  tag: string
  url: string
}

interface AppsDropdownMenuProps {
  appConfig: AppConfigProps
}

export async function AppsDropdownMenu({
  appConfig
}: AppsDropdownMenuProps): Promise<React.ReactElement> {
  const appsList = await getAppsList(appConfig.environment)

  return (
    <div className="z-10">
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="z-50">
          <Button
            variant="outline"
            className="rounded-xl w-9 h-9 cursor-pointer"
          >
            <Icon icon="grid-round" className="text-neutral-500" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <p className="font-medium ml-4 mt-2">Aplicações</p>
          <div className="grid grid-cols-3 gap-2 items-center justify-center p-4 w-full h-full overflow-auto">
            {appsList.map(app => (
              <Link
                key={app?.tag}
                href={app?.url}
                className="w-full p-2 hover:bg-gray-100 rounded-md flex flex-col items-center gap-2"
              >
                <div
                  key={app?.tag}
                  className="flex flex-col gap-2 items-center justify-center cursor-pointer rounded-md w-12 h-12 border bg-white"
                >
                  <Image
                    src={app?.icon}
                    alt={app?.label}
                    style={{ objectFit: 'contain' }}
                    width={32}
                  />
                </div>
                <p className="text-xs text-center font-medium">{app?.label}</p>
              </Link>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
