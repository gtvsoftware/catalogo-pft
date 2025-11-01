import { AppConfigProps } from '@/types/app.config'

import { BottomBarItem } from './BottomBarItem'
import { MenuItem } from './MenuItem'

interface BottomBarProps {
  appConfig: AppConfigProps
}

export async function BottomBar({
  appConfig
}: BottomBarProps): Promise<React.ReactElement> {
  const bottomBarItems = await appConfig?.BOTTOM_BAR_ITEMS()

  return (
    <div className="border-zinc-300 bg-background fixed bottom-0 left-0 z-50 flex items-center justify-center h-14 w-full border-t bg-white md:hidden">
      {/* <div className="w-11 h-11 bg-background absolute right-0 left-0 bottom-9 mx-auto flex items-center justify-center border-b rounded-full">
        <div className="w-9 h-9 bg-background rounded-full flex items-center justify-center border">
          <Image
            src={APP_CONFIG?.TV_LOGO}
            alt="logo"
            width={24}
            style={{ objectFit: "contain" }}
          />
        </div>
      </div> */}
      <div className="flex items-center justify-between h-full w-full font-medium px-2">
        {bottomBarItems.map((item, index) => (
          <BottomBarItem
            key={item.key}
            href={item.href}
            label={item.label}
            icon={item.icon}
          />
        ))}

        <MenuItem />
      </div>
    </div>
  )
}
