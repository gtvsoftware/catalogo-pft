'use client'

import { cn } from '@terraviva/ui/cn'
import {
  NavigationMenu,
  NavigationMenuList,
} from '@terraviva/ui/navigation-menu'
import { usePathname } from 'next/navigation'
import type { HeaderItem, HeaderSubitem } from '@/types'
import { ItemWithItems } from './components/headerItems/itemWithItems'
import { ItemWithSections } from './components/headerItems/itemWithSections'
import { DefaultItem } from './components/headerItems/defaultItem'

interface HeaderBrandProps {
  menuItems: HeaderItem[]
}

export function NavItems({ menuItems }: HeaderBrandProps): React.ReactElement {
  const path: string = usePathname()

  const getItemClassNames = (itemPath: string, subitems?: HeaderSubitem[]) => {
    const active = subitems?.some(subitem => itemPath + subitem.path === path)

    return cn(
      'focus:bg-transparent focus:text-primary-500 hover:bg-transparent hover:text-primary-500 font-medium',
      subitems && active && 'bg-transparent text-primary-500',
      path === itemPath && 'bg-transparent text-primary-500'
    )
  }

  return (
    <NavigationMenu delayDuration={0}>
      <NavigationMenuList className="hidden lg:flex">
        {menuItems?.map((item, index) =>
          item.items ? (
            <ItemWithItems
              key={`${item.value}${index}`}
              item={item}
              classNames={getItemClassNames(item.path, item.items)}
            />
          ) : item?.sections ? (
            <ItemWithSections
              item={item}
              key={`${item.value}${index}`}
              classNames={getItemClassNames(
                item.path,
                item?.sections?.map(item => item.items).flat()
              )}
            />
          ) : (
            <DefaultItem
              item={item}
              key={`${item.value}${index}`}
              classNames={getItemClassNames(item.path)}
            />
          )
        )}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
