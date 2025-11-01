'use client'

import { Icon } from '../icon'
import { useSidebar } from '../sidebar'

export function MenuItem(): React.ReactElement {
  const { toggleSidebar } = useSidebar()

  return (
    <div
      className={`dark:hover:bg-gray-5ß00 group inline-flex flex-col items-center w-1/5 justify-center gap-1`}
      onClick={() => {
        toggleSidebar()
      }}
    >
      <Icon
        icon={'bars'}
        family="duotone"
        className={`text-zinc-600 text-md`}
      />
      <span className={` text-zinc-600 text-[10px]`}>Menu</span>
    </div>
  )
}
