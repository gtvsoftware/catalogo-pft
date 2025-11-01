import React from 'react'

import { cn } from '../../utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from './alert-dialog'
import { buttonVariants } from './button'
import { Icon } from './icon'

export interface ModalAction {
  title: string
  onPress: () => void | Promise<void>
  variant?:
    | 'default'
    | 'destructive'
    | 'outline-solid'
    | 'secondary'
    | 'ghost'
    | 'link'
  disabled?: boolean
  loading?: boolean
  icon?: React.ReactNode
  asChild?: boolean
}

export interface DynamicModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  subtitle?: string
  description?: string
  actions?: ModalAction[]
  showCloseButton?: boolean
  closeButtonTitle?: string
  maxWidth?: string
  className?: string
  overlayClassName?: string
  children?: React.ReactNode
}

export function DynamicModal({
  open,
  onOpenChange,
  title,
  subtitle,
  description,
  actions = [],
  showCloseButton = true,
  closeButtonTitle = 'Cancel',
  maxWidth = 'sm:max-w-lg',
  className,
  children
}: DynamicModalProps) {
  const handleClose = () => {
    onOpenChange(false)
  }

  const renderActions = () => {
    const allActions = showCloseButton
      ? [
          {
            title: closeButtonTitle,
            onPress: handleClose,
            variant: 'outline-solid' as const
          },
          ...actions
        ]
      : actions

    if (allActions.length === 0) return null

    const hasMultipleActions = allActions.length > 1
    const hasThreeOrMore = allActions.length >= 3

    return (
      <AlertDialogFooter
        className={cn(
          hasThreeOrMore && 'flex-col gap-2 sm:flex-col',
          !hasMultipleActions && 'justify-center'
        )}
      >
        {allActions.map((action, index) => {
          const isCancel = showCloseButton && index === 0
          const Component = isCancel ? AlertDialogCancel : AlertDialogAction

          return (
            <Component
              key={index}
              onClick={action.onPress}
              disabled={action.disabled || action.loading}
              className={cn(
                buttonVariants({ variant: action.variant || 'default' }),
                hasThreeOrMore && 'w-full',
                action.loading && 'cursor-not-allowed'
              )}
            >
              {action.loading && (
                <Icon
                  icon="spinner-third"
                  className="mr-2 h-4 w-4 animate-spin"
                />
              )}
              {action.icon && !action.loading && (
                <span className="mr-2">{action.icon}</span>
              )}
              {action.title}
            </Component>
          )
        })}
      </AlertDialogFooter>
    )
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className={cn(maxWidth, className)}
        onEscapeKeyDown={() => onOpenChange(false)}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>

          {subtitle && (
            <div className="text-muted-foreground font-medium text-base">
              {subtitle}
            </div>
          )}

          {description && (
            <AlertDialogDescription className="text-left">
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>

        {children && <div className="py-2">{children}</div>}

        {renderActions()}
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Hook for managing modal state
export const useModal = (initialState = false) => {
  const [open, setOpen] = React.useState(initialState)

  const openModal = React.useCallback(() => setOpen(true), [])
  const closeModal = React.useCallback(() => setOpen(false), [])
  const toggleModal = React.useCallback(() => setOpen(prev => !prev), [])

  return {
    open,
    openModal,
    closeModal,
    toggleModal,
    onOpenChange: setOpen
  }
}

// Confirmation Modal variant
type ConfirmationModalProps = Omit<DynamicModalProps, 'actions'> & {
  onConfirm: () => void | Promise<void>
  confirmTitle?: string
  confirmVariant?: 'default' | 'destructive'
  isLoading?: boolean
}

export function ConfirmationModal({
  onConfirm,
  confirmTitle = 'Confirm',
  confirmVariant = 'default',
  isLoading = false,
  ...props
}: ConfirmationModalProps) {
  const actions: ModalAction[] = [
    {
      title: confirmTitle,
      onPress: onConfirm,
      variant: confirmVariant,
      disabled: isLoading,
      loading: isLoading
    }
  ]

  return <DynamicModal {...props} actions={actions} />
}

// Alert Modal variant (single action)
type AlertModalProps = Omit<
  DynamicModalProps,
  'actions' | 'showCloseButton'
> & {
  buttonTitle?: string
  buttonVariant?: 'default' | 'destructive' | 'outline-solid' | 'secondary'
}

export function AlertModal({
  buttonTitle = 'OK',
  buttonVariant = 'default',
  onOpenChange,
  ...props
}: AlertModalProps) {
  const actions: ModalAction[] = [
    {
      title: buttonTitle,
      onPress: () => onOpenChange(false),
      variant: buttonVariant
    }
  ]

  return (
    <DynamicModal
      {...props}
      onOpenChange={onOpenChange}
      actions={actions}
      showCloseButton={false}
    />
  )
}

// Destructive Confirmation Modal variant
type DestructiveConfirmationModalProps = Omit<
  ConfirmationModalProps,
  'confirmVariant'
>

export function DestructiveConfirmationModal({
  confirmTitle = 'Delete',
  ...props
}: DestructiveConfirmationModalProps) {
  return (
    <ConfirmationModal
      {...props}
      confirmTitle={confirmTitle}
      confirmVariant="destructive"
    />
  )
}
