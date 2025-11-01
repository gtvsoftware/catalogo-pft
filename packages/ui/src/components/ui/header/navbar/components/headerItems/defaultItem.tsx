import {
  NavigationMenuItem,
  navigationMenuTriggerStyle
} from '@terraviva/ui/navigation-menu'
import { cn } from '@terraviva/ui/cn'
import { HeaderItem } from '@/types'
import Link from 'next/link'

interface DefaultItemProps {
  item: HeaderItem
  classNames: string
}

export function DefaultItem({
  item,
  classNames
}: DefaultItemProps): React.ReactElement {
  return (
    <NavigationMenuItem>
      <Link
        href={item.path}
        className={cn(navigationMenuTriggerStyle(), classNames)}
      >
        {item?.label}
      </Link>
    </NavigationMenuItem>
  )
}
