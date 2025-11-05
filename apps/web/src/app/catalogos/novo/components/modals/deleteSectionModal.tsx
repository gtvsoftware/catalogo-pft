'use client'

import { useState } from 'react'
import {} from 'react-easy-crop'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@terraviva/ui/dialog'
import { Icon } from '@terraviva/ui/icon'
import { Button } from '@terraviva/ui/button'

interface DeleteSectionModalProps {
  removeFn: () => void
}

export function DeleteSectionModal({ removeFn }: DeleteSectionModalProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="w-8 h-8 border rounded-sm cursor-pointer flex items-center justify-center hover:bg-gray-100">
          <Icon icon="trash-can" family="duotone" />
        </div>
      </DialogTrigger>

      <DialogContent className="max-h-[90%] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Excluir seção</DialogTitle>
        </DialogHeader>
        <p className="text-gray-500 text-sm">
          Você tem certeza que deseja excluir a seção?
        </p>
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
