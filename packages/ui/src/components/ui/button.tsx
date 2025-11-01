import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '../../utils'
import { Icon } from './icon'
import type { IconName } from './icon/iconTypes'

// Shared button variants (without icon size)
const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive relative',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
        destructive:
          'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary:
          'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
        ghost:
          'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline'
      },
      size: {
        default: 'h-9 px-4 py-2 gap-2',
        sm: 'h-8 rounded-md gap-1.5 px-3',
        lg: 'h-10 rounded-md px-6 gap-2'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

// Icon button specific variants
const iconButtonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
        destructive:
          'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary:
          'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
        ghost:
          'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline'
      },
      size: {
        default: 'size-9 text-sm',
        sm: 'size-8 text-xs',
        lg: 'size-10 text-base'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

// Loading spinner component
const LoadingSpinner = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { size?: 'sm' | 'default' | 'lg' }
>(({ className, size = 'default', ...props }, ref) => {
  const sizeClasses = {
    sm: 'size-3',
    default: 'size-4',
    lg: 'size-5'
  }

  return (
    <div
      ref={ref}
      className={cn(
        'animate-spin rounded-full border-2 border-current border-t-transparent',
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
})
LoadingSpinner.displayName = 'LoadingSpinner'

// Regular Button component
export interface ButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: IconName
  rightIcon?: IconName
  isAutocomplete?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      isAutocomplete = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button'
    const isDisabled = disabled || loading

    const getSpinnerSize = (): 'sm' | 'default' | 'lg' => {
      if (size === 'sm') return 'sm'
      if (size === 'lg') return 'lg'
      return 'default'
    }

    const getIconSize = () => {
      if (size === 'sm') return 'text-xs'
      if (size === 'lg') return 'text-base'
      return 'text-sm'
    }

    const renderIcon = (iconProp: IconName | undefined, isLeft: boolean) => {
      if (!iconProp) return null

      // Show spinner instead of left icon when loading
      if (loading && isLeft) {
        return <LoadingSpinner size={getSpinnerSize()} />
      }

      return <Icon icon={iconProp} className={cn('shrink-0', getIconSize())} />
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {renderIcon(leftIcon, true)}

        {isAutocomplete ? (
          children
        ) : (
          <span className={cn(loading && !leftIcon && 'opacity-0')}>
            {children}
          </span>
        )}

        {loading && !leftIcon && (
          <div className="absolute inset-0 flex items-center justify-center">
            <LoadingSpinner size={getSpinnerSize()} />
          </div>
        )}
        {renderIcon(rightIcon, false)}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

// Icon Button component
export interface IconButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof iconButtonVariants> {
  asChild?: boolean
  loading?: boolean
  icon?: IconName
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      icon,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button'
    const isDisabled = disabled || loading

    const getSpinnerSize = (): 'sm' | 'default' | 'lg' => {
      if (size === 'sm') return 'sm'
      if (size === 'lg') return 'lg'
      return 'default'
    }

    const getIconSize = () => {
      if (size === 'sm') return 'text-xs'
      if (size === 'lg') return 'text-base'
      return 'text-sm'
    }

    const renderIcon = () => {
      if (loading) {
        return <LoadingSpinner size={getSpinnerSize()} />
      }

      if (!icon) return null

      return <Icon icon={icon} className={getIconSize()} />
    }

    return (
      <Comp
        className={cn(iconButtonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {renderIcon()}
      </Comp>
    )
  }
)
IconButton.displayName = 'IconButton'

export {
  Button,
  IconButton,
  buttonVariants,
  iconButtonVariants,
  LoadingSpinner
}