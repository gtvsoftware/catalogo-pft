import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '../../utils'
import { Icon } from './icon'

const alertVariants = cva(
  'relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[auto_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0 items-start [&>svg]:size-4 [&>svg]:mt-0.5 [&>svg]:text-current transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground border-border',
        destructive:
          'text-destructive bg-destructive/5 border-destructive/20 [&>svg]:text-destructive data-[slot=alert-description]:*:text-destructive/90',
        warning:
          'text-amber-700 bg-amber-50 border-amber-200 [&>svg]:text-amber-600 data-[slot=alert-description]:*:text-amber-700/90 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400 dark:[&>svg]:text-amber-500',
        success:
          'text-green-700 bg-green-50 border-green-200 [&>svg]:text-green-600 data-[slot=alert-description]:*:text-green-700/90 dark:bg-green-950/20 dark:border-green-900/30 dark:text-green-400 dark:[&>svg]:text-green-500',
        info: 'text-blue-700 bg-blue-50 border-blue-200 [&>svg]:text-blue-600 data-[slot=alert-description]:*:text-blue-700/90 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-400 dark:[&>svg]:text-blue-500'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

// Storage utility for dismissed alerts (using localStorage)
const DISMISSED_ALERTS_KEY = 'dismissed-alerts'

const getDismissedAlerts = (): string[] => {
  if (typeof window === 'undefined') return []
  try {
    const dismissed = localStorage.getItem(DISMISSED_ALERTS_KEY)
    return dismissed ? JSON.parse(dismissed) : []
  } catch (error) {
    console.warn('Error reading dismissed alerts from localStorage:', error)
    return []
  }
}

const addDismissedAlert = (dismissKey: string) => {
  if (typeof window === 'undefined') return
  try {
    const dismissed = getDismissedAlerts()
    if (!dismissed.includes(dismissKey)) {
      dismissed.push(dismissKey)
      localStorage.setItem(DISMISSED_ALERTS_KEY, JSON.stringify(dismissed))
    }
  } catch (error) {
    console.warn('Error saving dismissed alert to localStorage:', error)
  }
}

const isAlertDismissed = (dismissKey: string): boolean => {
  return getDismissedAlerts().includes(dismissKey)
}

export const clearDismissedAlerts = () => {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(DISMISSED_ALERTS_KEY)
  } catch (error) {
    console.warn('Error clearing dismissed alerts from localStorage:', error)
  }
}

export const undismissAlert = (dismissKey: string) => {
  if (typeof window === 'undefined') return
  try {
    const dismissed = getDismissedAlerts()
    const filtered = dismissed.filter(key => key !== dismissKey)
    localStorage.setItem(DISMISSED_ALERTS_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.warn('Error un-dismissing alert from localStorage:', error)
  }
}

const getDefaultIcon = (
  variant: VariantProps<typeof alertVariants>['variant']
) => {
  switch (variant) {
    case 'destructive':
      return <Icon icon="triangle-exclamation" />
    case 'warning':
      return <Icon icon="circle-exclamation" />
    case 'success':
      return <Icon icon="check-circle" />
    case 'info':
      return <Icon icon="circle-info" />
    default:
      return <Icon icon="circle-info" />
  }
}

interface AlertProps
  extends React.ComponentProps<'div'>,
    VariantProps<typeof alertVariants> {
  showIcon?: boolean
  icon?: React.ComponentType<{ className?: string }>
  isLoading?: boolean
  dismissible?: boolean
  dismissKey?: string
  onDismiss?: () => void
  showDismissIcon?: boolean
}

function Alert({
  className,
  variant,
  showIcon = true,
  icon,
  isLoading = false,
  dismissible = false,
  dismissKey,
  onDismiss,
  showDismissIcon = true,
  children,
  ...props
}: AlertProps) {
  const [isDismissed, setIsDismissed] = React.useState(false)

  React.useEffect(() => {
    if (dismissible && dismissKey) {
      setIsDismissed(isAlertDismissed(dismissKey))
    }
  }, [dismissible, dismissKey])

  const handleDismiss = React.useCallback(() => {
    if (dismissKey) {
      addDismissedAlert(dismissKey)
      setIsDismissed(true)
    }
    onDismiss?.()
  }, [dismissKey, onDismiss])

  if (dismissible && isDismissed) {
    return null
  }

  if (process.env.NODE_ENV === 'development' && dismissible && !dismissKey) {
    console.warn(
      'Alert: dismissible is true but dismissKey is not provided. Alert will not persist dismissal.'
    )
  }

  const IconComponent = icon || getDefaultIcon(variant)

  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(
        alertVariants({ variant }),
        dismissible && 'pr-10', // Add padding for dismiss button
        className
      )}
      {...props}
    >
      <div className="absolute left-4 top-3.5">
        {showIcon && (
          <>
            {isLoading ? (
              <Icon icon="spinner-third" className="animate-spin" />
            ) : (
              IconComponent
            )}
          </>
        )}
      </div>

      <div
        className={cn(
          'col-start-2 space-y-0.5',
          showIcon && 'ml-7' // Add left margin when icon is shown
        )}
      >
        {children}
      </div>

      {dismissible && showDismissIcon && (
        <button
          onClick={handleDismiss}
          className="absolute right-2 top-2 rounded-md p-1 hover:bg-black/5 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors dark:hover:bg-white/5"
          aria-label="Dismiss alert"
        >
          <Icon icon="xmark" className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        'line-clamp-1 min-h-4 font-medium tracking-tight',
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        'text-black grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed opacity-90 in-[.has-title]:mt-0.5',
        className
      )}
      {...props}
    />
  )
}

// Composed Alert component for simple usage
interface AlertComposedProps extends Omit<AlertProps, 'children'> {
  title?: string
  description?: string | React.ReactNode
}

function AlertComposed({
  title,
  description,
  variant = 'default',
  ...alertProps
}: AlertComposedProps) {
  return (
    <Alert variant={variant} {...alertProps}>
      <div className={title ? 'has-title' : ''}>
        {title && <AlertTitle>{title}</AlertTitle>}
        {description && <AlertDescription>{description}</AlertDescription>}
      </div>
    </Alert>
  )
}

export { Alert, AlertTitle, AlertDescription, AlertComposed, alertVariants }
