'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import Cropper, { Area, Point } from 'react-easy-crop'
import Image from 'next/image'
import { v4 as randomUUID } from 'uuid'
import { cn } from '@terraviva/ui/cn'
import { itemFormSchema } from '@/schemas/itemSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import getCroppedImg from '@/utils/image'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@terraviva/ui/dialog'
import { Icon } from '@terraviva/ui/icon'
import { Input } from '@terraviva/ui/input'
import { Slider } from '@terraviva/ui/slider'
import { Button } from '@terraviva/ui/button'
import { ProductsModal } from './ProductsModal'

interface CreateItemFormModalProps {
  append: (item: itemFormType) => void
}

export function CreateItemFormModal({ append }: CreateItemFormModalProps) {
  const [open, setOpen] = useState(false)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [showCropper, setShowCropper] = useState(false)

  const inputRef = useRef<HTMLInputElement | null>(null)

  const formValues = useForm<itemFormType>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      id: '',
      image: '',
      name: '',
      description: '',
      price: undefined,
      discountPrice: undefined
    }
  })

  const {
    register: localRegister,
    handleSubmit: localHandleSubmit,
    watch: localWatch,
    setValue: localSetValue,
    reset: localReset,
    formState: { errors }
  } = formValues

  const { image } = localWatch()

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader()
      reader.onload = () => setImageSrc(reader.result as string)
      reader.readAsDataURL(e.target.files[0])
      setShowCropper(true)
    }
  }

  const showCroppedImage = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) return
    try {
      const cropped = await getCroppedImg(imageSrc, croppedAreaPixels)
      localSetValue('image', cropped, { shouldValidate: true })
      setShowCropper(false)
      setImageSrc(null)
    } catch (err) {
      console.error(err)
    }
  }, [imageSrc, croppedAreaPixels, localSetValue])

  const onSubmit = (data: itemFormType) => {
    append({
      ...data,
      id: randomUUID()
    })
    setOpen(false)
  }

  useEffect(() => {
    if (!open) {
      localReset()
      setImageSrc(null)
      setShowCropper(false)
    }
  }, [open])

  return (
    <FormProvider {...formValues}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div className="border-2 cursor-pointer border-dashed h-full w-full aspect-square flex flex-col items-center justify-center bg-gray-100 rounded-md">
            <Icon icon="plus-circle" className="text-primary-500 text-2xl" />
          </div>
        </DialogTrigger>

        <DialogContent className="max-h-[90%] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo item</DialogTitle>
          </DialogHeader>

          <form onSubmit={localHandleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-col gap-2 w-full items-center justify-center">
              <div
                onClick={() => !showCropper && inputRef.current?.click()}
                className={cn(
                  'relative flex items-center justify-center w-[300px] aspect-square overflow-hidden cursor-pointer rounded-md border-2 border-dashed',
                  errors.image ? 'border-red-500 border-solid' : 'border-dashed'
                )}
              >
                <Input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  onChange={onSelectFile}
                  className="hidden"
                />

                {image && !showCropper && (
                  <Image
                    src={image}
                    alt="Banner"
                    fill
                    className="object-cover"
                  />
                )}

                {!image && !showCropper && (
                  <div className="w-full h-full bg-white flex items-center justify-center">
                    <Icon
                      icon="image-stack"
                      family="duotone"
                      className="text-4xl"
                    />
                  </div>
                )}

                {showCropper && (
                  <Cropper
                    crop={crop}
                    aspect={1}
                    zoom={zoom}
                    image={imageSrc!}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={(_, b) => setCroppedAreaPixels(b)}
                  />
                )}

                {!showCropper && (
                  <div className="absolute bg-black/50 opacity-0 hover:opacity-100 duration-500 inset-0 flex items-center justify-center">
                    <p className="text-white">
                      Clique para selecionar uma imagem
                    </p>
                  </div>
                )}
              </div>
              {errors.image && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.image.message}
                </p>
              )}
            </div>
            {showCropper && (
              <div className="flex flex-col gap-2 items-center">
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
                  className={errors.image && 'border border-red-500'}
                >
                  Confirmar
                </Button>
              </div>
            )}
            <div className="space-y-1">
              <p className="font-medium text-sm">Nome</p>
              <div className="flex w-full items-center gap-2">
                <Input
                  {...localRegister('name')}
                  placeholder="Nome"
                  className={cn(errors.name && 'border-red-500')}
                />
                <ProductsModal
                  buttonClassName={cn(errors.name && 'border-red-500')}
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <p className="font-medium text-sm">Descrição</p>
              <Input
                {...localRegister('description')}
                placeholder="Descrição (opcional)"
                className={cn(errors.description && 'border-red-500')}
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <p className="font-medium text-sm">Preço</p>
                <Input
                  {...localRegister('price')}
                  placeholder="Preço (opcional)"
                  className={cn(errors.price && 'border-red-500')}
                />
                {errors.price && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.price.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <p className="font-medium text-sm">Preço com desconto</p>
                <Input
                  {...localRegister('discountPrice')}
                  placeholder="Preço com desconto (opcional)"
                  className={cn(errors.discountPrice && 'border-red-500')}
                />
                {errors.discountPrice && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.discountPrice.message}
                  </p>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full">
              Adicionar item
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </FormProvider>
  )
}
