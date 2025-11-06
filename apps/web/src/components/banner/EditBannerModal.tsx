'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@terraviva/ui/dialog'
import { Button } from '@terraviva/ui/button'
import { Icon } from '@terraviva/ui/icon'
import { useForm, useFormContext } from 'react-hook-form'
import pattern from '@/assets/pattern_green.png'
import Cropper, { Area, Point } from 'react-easy-crop'
import getCroppedImg, { onSelectFile } from '@/utils/image'
import Image from 'next/image'
import { Slider } from '@terraviva/ui/slider'
import { Input } from '@terraviva/ui/input'
import { cn } from '@terraviva/ui/cn'

export function EditBannerModal() {
  const { watch, setValue } = useFormContext<catalogoFormType>()

  const { banner, title, caption } = watch()

  const {
    handleSubmit: localHandleSubmit,
    register: localResgister,
    setValue: localSetvalue,
    watch: localWatch,
    reset: localReset
  } = useForm()

  const { banner: localBanner } = localWatch()

  const [open, setOpen] = useState(false)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [showCropper, setShowCropper] = useState(false)

  const inputRef = useRef<HTMLInputElement | null>(null)

  const showCroppedImage = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) return

    try {
      const cropped = await getCroppedImg(imageSrc, croppedAreaPixels)

      localSetvalue('banner', cropped)
      setShowCropper(false)
      setImageSrc(null)
    } catch (err) {
      console.error(err)
    }
  }, [imageSrc, croppedAreaPixels])

  const onSubmit = (data: {
    banner?: string
    title?: string
    caption?: string
  }) => {
    const { banner, title, caption } = data
    setValue('banner', banner)
    setValue('caption', caption)
    setValue('title', title || 'Título')
    setOpen(false)
  }

  useEffect(() => {
    if (!open) {
      localReset()
      setImageSrc(null)
      setShowCropper(false)
    }

    localReset({ banner, title, caption })
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="w-8 h-8 rounded-md absolute right-2 top-2 bg-white border  hover:bg-gray-100 ">
        <Icon icon="pen-to-square" family="duotone" />
      </DialogTrigger>

      <DialogContent className="max-h-[90%] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar catálogo</DialogTitle>
        </DialogHeader>
        <form
          className="flex flex-col gap-4 items-center w-full"
          onSubmit={localHandleSubmit(onSubmit)}
        >
          <div className="flex flex-col  gap-1 w-full">
            <p className="font-medium">Banner</p>
            <div
              onClick={() => !showCropper && inputRef.current?.click()}
              className={cn(
                'relative w-full aspect-[3/1] overflow-hidden cursor-pointer rounded-lg bg-black border'
              )}
            >
              <Input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={e => onSelectFile(e, setImageSrc, setShowCropper)}
                className="hidden"
              />

              {!showCropper && (
                <Image
                  src={localBanner ?? pattern}
                  alt="Banner"
                  fill
                  className="object-cover"
                />
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
              <div className="w-full mt-2 flex flex-col gap-3 items-center">
                <Slider
                  min={1}
                  max={3}
                  step={0.1}
                  value={[zoom]}
                  onValueChange={value => setZoom(Number(value[0]))}
                />
                <Button
                  type="button"
                  onClick={showCroppedImage}
                  className="w-full"
                >
                  Confirmar recorte
                </Button>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1 w-full">
            <p className="font-medium">Título</p>
            <Input {...localResgister('title')} placeholder="Título" />
          </div>
          <div className="flex flex-col gap-1 w-full">
            <p className="font-medium">Subtítulo</p>
            <Input {...localResgister('caption')} placeholder="Subtítulo" />
          </div>
          <div className="w-full flex gap-2 items-center justify-end">
            <DialogClose className="text-sm text-red-500 border-red-500 bg-white hover:bg-gray-100 border py-2 px-4 rounded-md">
              Cancelar
            </DialogClose>
            <Button type="submit" className="rounded-md">
              Confirmar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
