'use client'

import Image from 'next/image'
import { useFormContext } from 'react-hook-form'

import pattern from '@/assets/pattern_green.png'
import { EditBannerModal } from './EditBannerModal'

export function Banner(): React.ReactElement {
  const { watch } = useFormContext<catalogoFormType>()

  const { banner, title, caption } = watch()

  return (
    <div className="flex flex-col items-center justify-center w-full aspect-[3/1] relative">
      <Image
        src={banner ?? pattern}
        alt="Banner"
        fill
        className="object-cover"
      />
      <p
        className="z-10 text-6xl font-bold text-white"
        style={{ mixBlendMode: 'difference' }}
      >
        {title}
      </p>
      {caption && (
        <p
          className="z-10 text-2xl font-bold text-white"
          style={{ mixBlendMode: 'difference' }}
        >
          {caption}
        </p>
      )}

      <EditBannerModal />
    </div>
  )
}
