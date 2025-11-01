'use client'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@terraviva/ui/collapsible'
import { Icon } from '@terraviva/ui/icon'
import { HeaderItem, HeaderSubitem } from '@/types'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@terraviva/ui/cn'

interface HeaderDropdownContentProps {
  menuItems: HeaderItem[]
}

export function
HeaderDropdownContent({
  menuItems
}: HeaderDropdownContentProps): React.ReactElement {
  const path = usePathname()
  const getItemClassNames = (itemPath: string, subitems?: HeaderSubitem[]) => {
    return cn(
      'focus:bg-transparent focus:text-primary-500 hover:bg-transparent hover:text-primary-500 font-medium',
      path === itemPath && 'bg-transparent text-primary-500'
    )
  }

  return (
    <div className="flex flex-col gap-2 p-2">
      <p className="font-medium text-sm">Menu</p>
      {menuItems.map((item, index) => {
        const subitems = item?.items
          ? item?.items
          : item?.sections
            ? item.sections?.map(subitem => subitem.items)?.flat()
            : []

        return subitems.length ? (
          <Collapsible
            defaultOpen
            className="group/collapsible"
            key={`${item.value}${index}`}
          >
            <CollapsibleTrigger className="flex justify-between items-center border rounded-md px-3 py-4 w-full hover:bg-gray-100 cursor-pointer">
              <div className="flex gap-3 items-center">
                <Icon
                  icon={item.icon}
                  className="text-lg text-primary-500"
                  family="duotone"
                />
                <p className="text-sm font-medium">{item.label}</p>
              </div>
              <Icon
                icon="chevron-down"
                className="text-xs data-[state:open]:rotate-180"
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="flex flex-col gap-2 p-2 ml-2">
              {subitems?.map((subitem, index) => (
                <Link
                  href={item.path + subitem.path}
                  key={`${subitem.value}${index}`}
                  className={cn(
                    'flex items-center justify-start gap-3 hover:bg-gray-100 p-1 rounded-md',
                    getItemClassNames(item.path + subitem.path, subitems)
                  )}
                >
                  <Icon
                    icon={subitem.icon}
                    className="text-base w-8 h-8 border text-primary-500 bg-white rounded-md"
                    family="duotone"
                  />

                  <p className="mb-1 text-xs font-medium leading-none flex gap-1">
                    {subitem.label}
                  </p>
                </Link>
              ))}
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <Link
            href={item.path}
            key={`${item.value}${index}`}
            className={cn(
              'flex items-center justify-start gap-3 border rounded-md px-3 py-4 hover:bg-gray-100',
              getItemClassNames(item.path)
            )}
          >
            <Icon
              icon={item.icon}
              className="text-lg text-primary-500"
              family="duotone"
            />
            <p className="text-sm font-medium">{item.label}</p>
          </Link>
        )
      })}
    </div>
  )
}
