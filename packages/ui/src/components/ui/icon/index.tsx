'use client'

import * as React from 'react'

import { cn } from '../../../utils'
import type { IconFamily, IconName, IconStyle } from './iconTypes'

export interface IconProps extends React.HTMLAttributes<HTMLElement> {
  icon: IconName
  variant?: IconStyle
  family?: IconFamily
  className?: string
}

const Icon = React.forwardRef<React.ElementRef<'span'>, IconProps>(
  ({ icon, variant, family, className, ...props }, ref) => (
    <span className={cn('flex items-center justify-center', className)}>
      <i
        ref={ref}
        className={cn(
          `${variant ? `fa-${variant}` : 'fa-solid'}`,
          `${family ? `fa-${family}` : 'fa-classic'}`,
          `${icon ? `fa-${icon}` : 'fa-question'} `
        )}
        {...props}
      />
    </span>
  )
)

Icon.displayName = 'Icon'

export { Icon }
