'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Icon } from '../icon'

interface BottomBarItemProps {
  icon: string
  href: string
  label: string
  className?: string
}

export function BottomBarItem({
  icon,
  href,
  label,
  className
}: BottomBarItemProps): React.ReactElement {
  const pathname = usePathname()
  const currentPath = pathname === href
  const isActive = pathname.split('/').includes(href.substring(1))

  return (
    <Link
      href={currentPath ? '' : href}
      className={`dark:hover:bg-gray-5ß00 group inline-flex flex-col items-center w-1/5 justify-center gap-1 ${className}`}
    >
      <Icon
        icon={icon}
        family="duotone"
        className={`group-hover:text-primary-500 text-md ${
          isActive ? 'text-primary-500' : 'text-zinc-600'
        } `}
      />
      <span
        className={`group-hover:text-primary-500 text-[10px] 
        ${isActive ? 'text-primary-500 font-semibold' : 'text-zinc-600'}`}
      >
        {label}
      </span>
    </Link>
  )
}
