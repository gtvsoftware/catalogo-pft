import { cn } from '@terraviva/ui/cn'
import { DropdownItem } from '../dropdownItem'
import { HeaderItem } from '@/types'
import {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuTrigger
} from '@terraviva/ui/navigation-menu'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import useWindowDimensions from '../../hooks/useWindowDimensions'

interface ItemWithItemsProps {
  classNames: string
  item: HeaderItem
}

export function ItemWithItems({
  item,
  classNames
}: ItemWithItemsProps): React.ReactElement {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null);
  const [left, setLeft] = useState(0);

  const { width } = useWindowDimensions()

  useLayoutEffect(() => {
    if (!open) return;
    let raf;

    const measure = () => {
      setTimeout(() => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const delta = (width - 16) - rect.right;
        setLeft(prev => prev + delta >= 0 ? 0 : prev + delta );
      }, 500);
    };
    raf = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(raf);
  }, [open]);

  useEffect(() => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const delta = (width - 16) - rect.right;

    setLeft(prev => prev + delta >= 0 ? 0 : prev + delta );
  }, [width])

  return (
    <NavigationMenuItem >
      <NavigationMenuTrigger
        onPointerDown={() => setOpen(!open)}
        onPointerMove={event => event.preventDefault()}
        onPointerLeave={event => event.preventDefault()}
        className={cn(
          'data-[active]:bg-bg-transparent data-[state=open]:bg-transparent cursor-pointer data-active:text-primary-500 data-[state=open]:text-primary-500',
          classNames
        )}
      >
        {item.label}
      </NavigationMenuTrigger>
      <NavigationMenuContent
        ref={ref}
        style={{left}}
        onInteractOutside={() => setOpen(false)}
        onPointerLeave={event => event.preventDefault()}
      >
        <ul className="w-max space-y-1 p-2">
          {item.items?.map((items, index) => (
            <DropdownItem
              key={`${items.value}${index}`}
              title={items.label}
              href={item.path + items.path}
              className={`hover:text-primary-500 focus:text-primary-500 `}
              icon={items.icon}
            >
              {items.description}
            </DropdownItem>
          ))}
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  )
}
