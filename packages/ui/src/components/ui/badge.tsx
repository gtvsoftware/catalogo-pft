import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '../../utils'
import { Icon, type IconProps } from './icon'
import type { IconName } from './icon/iconTypes'

const badgeVariants = cva(
  'max-h-[22px] inline-flex items-center justify-center rounded-sm border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
        destructive:
          'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

interface BadgeProps
  extends React.ComponentProps<'span'>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean
  leftIcon?: IconName
  rightIcon?: IconName
}

function Badge({
  className,
  variant,
  asChild = false,
  leftIcon,
  rightIcon,
  children,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : 'span'

  const renderIcon = (iconProp: IconName | IconProps | undefined) => {
    if (!iconProp) return null

    if (typeof iconProp === 'string') {
      return <Icon icon={iconProp} className="shrink-0 size-3" />
    }

    const { className: iconClassName, ...iconProps } = iconProp
    return (
      <Icon {...iconProps} className={cn('shrink-0 size-3', iconClassName)} />
    )
  }

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    >
      {renderIcon(leftIcon)}
      {children}
      {renderIcon(rightIcon)}
    </Comp>
  )
}

export { Badge, badgeVariants }
