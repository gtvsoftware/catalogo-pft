import { HeaderItem } from '@/types'
import { cn } from '@terraviva/ui/cn'
import { DropdownItem } from '../dropdownItem'
import {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuTrigger
} from '@terraviva/ui/navigation-menu'
import { Icon } from '@terraviva/ui/icon'

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import useWindowDimensions from '../../hooks/useWindowDimensions'

interface ItemWithSectionsProps {
  item: HeaderItem
  classNames: string
}

export function ItemWithSections({
  item,
  classNames
}: ItemWithSectionsProps): React.ReactElement {
const [open, setOpen] = useState(false)
const { width } = useWindowDimensions();
const ref = useRef<HTMLDivElement>(null);
const [left, setLeft] = useState(0);

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
    <NavigationMenuItem>
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
        style={{left, transition: 'none'}}
        onInteractOutside={() => setOpen(false)}
      >
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${item.sections!.length || 1}, 1fr)`
          }}
        >
          {item.sections?.map((section, index) => (
            <div key={`${section.title}${index}`} className="px-2 py-4">
              {section.title && (
                <div className="flex gap-1 items-center mb-2 px-2">
                  {section?.icon && (
                    <Icon
                      icon={section?.icon || ''}
                      className={cn('text-xs', section.iconClassName)}
                    />
                  )}
                  <p className="text-xs text-gray-500">{section.title}</p>
                </div>
              )}
              <ul className="space-y-1">
                {section.items.map((subItem, index) => (
                  <DropdownItem
                    key={`${subItem.value}${index}`}
                    title={subItem.label}
                    sectionIcon={section?.icon}
                    href={item.path + subItem.path}
                    iconClassName={section.iconClassName}
                    className={`hover:text-primary-500 focus:text-primary-500`}
                    icon={subItem.icon}
                  >
                    {subItem.description}
                  </DropdownItem>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </NavigationMenuContent>
    </NavigationMenuItem>
  )
}
