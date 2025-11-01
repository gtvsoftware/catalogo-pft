'use client'

import * as React from 'react'

import { cn } from '../../utils'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from './dialog'

interface ModalProps {
  isOpen?: boolean
  onOpenChange?: (isOpen: boolean) => void
  isDismissable?: boolean
  isKeyboardDismissDisabled?: boolean
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

function Modal({
  isOpen,
  onOpenChange,
  isDismissable = true,
  isKeyboardDismissDisabled = false,
  children,
  className,
  style,
  ...props
}: ModalProps &
  Omit<React.ComponentProps<typeof Dialog>, 'open' | 'onOpenChange'>) {
  const handleClose = React.useCallback(() => {
    onOpenChange?.(false)
  }, [onOpenChange])

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange} {...props}>
      <DialogContent
        className={className}
        style={style}
        showCloseButton={isDismissable}
        onPointerDownOutside={
          isDismissable ? undefined : e => e.preventDefault()
        }
        onEscapeKeyDown={
          isKeyboardDismissDisabled ? e => e.preventDefault() : undefined
        }
      >
        {React.Children.map(children, child => {
          if (React.isValidElement(child) && child.type === ModalContent) {
            return React.cloneElement(child as React.ReactElement<any>, {
              onClose: handleClose
            })
          }
          return child
        })}
      </DialogContent>
    </Dialog>
  )
}

// ModalContent wrapper that provides onClose callback to children
interface ModalContentProps {
  children?: React.ReactNode | ((onClose: () => void) => React.ReactNode)
  className?: string
  onClose?: () => void
}

function ModalContent({
  children,
  className,
  onClose = () => {},
  ...props
}: ModalContentProps & React.ComponentProps<'div'>) {
  return (
    <div className={cn('flex flex-col h-full', className)} {...props}>
      {typeof children === 'function' ? children(onClose) : children}
    </div>
  )
}

// ModalHeader - maps to DialogHeader + DialogTitle
function ModalHeader({
  children,
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <DialogHeader className={cn('px-0 py-0', className)} {...props}>
      <DialogTitle className="text-lg font-semibold">{children}</DialogTitle>
    </DialogHeader>
  )
}

// ModalBody - main content area
function ModalBody({
  children,
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div className={cn('flex-1 py-4 px-0', className)} {...props}>
      {children}
    </div>
  )
}

// ModalFooter - maps to DialogFooter
function ModalFooter({
  children,
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <DialogFooter className={cn('px-0 py-0 gap-2', className)} {...props}>
      {children}
    </DialogFooter>
  )
}

export { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter }
