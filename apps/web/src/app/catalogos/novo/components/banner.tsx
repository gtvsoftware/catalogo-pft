'use client'

import React, { useState, useCallback, useRef } from 'react'
import Cropper, { Area, Point } from 'react-easy-crop'
import { Slider } from '@terraviva/ui/slider'
import { Input } from '@terraviva/ui/input'
import Image from 'next/image'
import getCroppedImg from '../../../../utils/getCroppedImg'
import pattern from '@/assets/pattern_green.png'
import { Button } from '@terraviva/ui/button'
import { cn } from '@terraviva/ui/cn'
import { useFormContext } from 'react-hook-form'

export function Banner(): React.ReactElement {
  const { watch, setValue } = useFormContext<catalogoFormType>()

  const { banner } = watch()

  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [showCropper, setShowCropper] = useState(false)

  const inputRef = useRef<HTMLInputElement | null>(null)

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader()

      reader.addEventListener('load', () =>
        setImageSrc(reader.result as string)
      )

      reader.readAsDataURL(e.target.files[0] as Blob)

      setShowCropper(true)
    }
  }

  const showCroppedImage = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) return

    try {
      const cropped = await getCroppedImg(imageSrc, croppedAreaPixels)

      setValue('banner', cropped)
      setShowCropper(false)
      setImageSrc(null)
    } catch (err) {
      console.error(err)
    }
  }, [imageSrc, croppedAreaPixels])

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div
        onClick={() => !showCropper && inputRef.current?.click()}
        className={cn(
          'relative w-full aspect-[3/1] overflow-hidden cursor-pointer rounded-lg bg-black'
        )}
      >
        <Input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={onSelectFile}
          className="hidden"
        />

        {!showCropper && (
          <Image
            src={banner ?? pattern}
            alt="Banner"
            fill
            className="object-cover"
          />
        )}

        {!banner && !showCropper && (
          <div className="absolute bg-gradient-to-t from-black/50 to-transparent duration-500 inset-0" />
        )}

        {showCropper && (
          <Cropper
            crop={crop}
            zoom={zoom}
            aspect={3 / 1}
            image={imageSrc!}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, b) => setCroppedAreaPixels(b)}
          />
        )}

        {!showCropper && (
          <div className="absolute bg-black/50 opacity-0 hover:opacity-100 duration-500 inset-0 flex items-center justify-center ">
            <p className="text-white">Clique para selecionar o banner</p>
          </div>
        )}
      </div>

      {showCropper && (
        <div className="w-[300px] mt-2 flex flex-col gap-3 items-center">
          <Slider
            min={1}
            max={3}
            step={0.1}
            value={[zoom]}
            onValueChange={value => setZoom(Number(value[0]))}
          />
          <Button onClick={showCroppedImage}>Confirmar</Button>
        </div>
      )}
    </div>
  )
}
