'use client'

import { Button } from '@terraviva/ui/button'
import { useRouter } from 'next/navigation'

export default function Page(): React.ReactElement {
  const { push } = useRouter()

  return (
    <div className="flex flex-col gap-8 w-screen">
      <div className="w-full flex justify-end">
        <Button leftIcon="plus" onClick={() => push('/novo')}>
          Novo catálogo
        </Button>
      </div>
    </div>
  )
}
