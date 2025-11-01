import { cn } from '@terraviva/ui/cn'
import { NavigationMenuLink } from '@terraviva/ui/navigation-menu'
import { usePathname } from 'next/navigation'
import React from 'react'
import { Icon } from '../../../icon'

export const DropdownItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'> & {
    sectionIcon?: string
    iconClassName?: string
    title: string
    children: string
    icon: string
  }
>(
  (
    {
      className,
      sectionIcon,
      title,
      iconClassName,
      children,
      icon,
      ...props
    }: any,
    ref
  ) => {
    const path = usePathname()

    return (
      <li>
        <NavigationMenuLink
          ref={ref}
          className={cn(
            'min-w-[300px] w-max block select-none space-y-1 rounded-md px-2 py-4 leading-none no-underline outline-hidden transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
            className
          )}
          {...props}
        >
          <div className="flex items-center justify-start gap-3">
            <Icon
              icon={icon}
              className="text-sm w-8 h-8 border rounded-md bg-white text-primary-500"
              family="duotone"
            />
            <div>
              <div
                className={cn(
                  'mb-1 text-sm font-medium leading-none flex gap-1',
                  path === props.href && 'text-primary-500'
                )}
              >
                <p>{title}</p>
                {sectionIcon && (
                  <Icon
                    icon={sectionIcon}
                    className={cn('text-[11px]', iconClassName)}
                  />
                )}
              </div>
              <p className="text-muted-foreground line-clamp-2 align-middle text-xs leading-4">
                {children}
              </p>
            </div>
          </div>
        </NavigationMenuLink>
      </li>
    )
  }
)
