import { useCallback, useState } from 'react'

export interface UseDisclosureProps {
  isOpen?: boolean
  defaultOpen?: boolean
  onClose?(): void
  onOpen?(): void
  onChange?(isOpen: boolean): void
}

export interface UseDisclosureReturn {
  isOpen: boolean
  onOpen(): void
  onClose(): void
  onToggle(): void
  onOpenChange(isOpen: boolean): void
}

/**
 * `useDisclosure` is a custom hook used to help handle common open, close, or toggle scenarios.
 * It can be used to control feedback component such as Modal, AlertDialog, Drawer, etc.
 *
 * @param props - The props for the useDisclosure hook
 * @returns An object with the current disclosure state and functions to update it
 */
export function useDisclosure(props: UseDisclosureProps = {}): UseDisclosureReturn {
  const {
    isOpen: isOpenProp,
    defaultOpen = false,
    onClose: onCloseProp,
    onOpen: onOpenProp,
    onChange: onChangeProp
  } = props

  const [isOpenState, setIsOpenState] = useState(defaultOpen)

  const isOpen = isOpenProp !== undefined ? isOpenProp : isOpenState

  const onClose = useCallback(() => {
    if (isOpenProp === undefined) {
      setIsOpenState(false)
    }
    onCloseProp?.()
    onChangeProp?.(false)
  }, [isOpenProp, onCloseProp, onChangeProp])

  const onOpen = useCallback(() => {
    if (isOpenProp === undefined) {
      setIsOpenState(true)
    }
    onOpenProp?.()
    onChangeProp?.(true)
  }, [isOpenProp, onOpenProp, onChangeProp])

  const onToggle = useCallback(() => {
    if (isOpen) {
      onClose()
    } else {
      onOpen()
    }
  }, [isOpen, onOpen, onClose])

  const onOpenChange = useCallback((nextIsOpen: boolean) => {
    if (nextIsOpen) {
      onOpen()
    } else {
      onClose()
    }
  }, [onOpen, onClose])

  return {
    isOpen,
    onOpen,
    onClose,
    onToggle,
    onOpenChange
  }
}