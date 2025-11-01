'use client'

import { useState, useEffect } from 'react'
import { DropdownMenu } from '@terraviva/ui/dropdown-menu'
import { usePathname } from 'next/navigation'

export function DropdownProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const path = usePathname()

  useEffect(() => setOpen(false), [path])

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      {children}
    </DropdownMenu>
  )
}
