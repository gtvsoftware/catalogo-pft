'use client'

import { Button } from '@terraviva/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@terraviva/ui/dialog'
import { useState } from 'react'

interface DeleteModalProps {
  removeFn: () => void
  title: string
  message: string
  trigger: React.ReactElement
}

export function DeleteModal({
  title,
  message,
  trigger,
  removeFn
}: DeleteModalProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="max-h-[90%] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className="text-gray-500 text-sm">{message}</p>
        <DialogFooter>
          <DialogClose className="text-sm text-red-500 border-red-500 bg-white hover:bg-gray-100 border py-2 px-4 rounded-md">
            Cancelar
          </DialogClose>
          <Button
            variant={'destructive'}
            className="rounded-md"
            onClick={() => removeFn()}
          >
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
