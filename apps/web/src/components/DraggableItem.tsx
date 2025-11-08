'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@terraviva/ui/button'
import { cn } from '@terraviva/ui/cn'
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
import { ObjectId } from 'bson'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import Cropper, { Area, Point } from 'react-easy-crop'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'

import { itemFormSchema } from '@/schemas/itemSchema'
import getCroppedImg, { base64ToFile } from '@/utils/image'

import { DeleteModal } from './DeleteModal'
import { ProductsModal } from './ProductsModal'

interface DraggableItemProps {
  sectionIndex: number
  itemIndex: number
  removeFn: () => void
}

export function DraggableItem({
  sectionIndex,
  itemIndex,
  removeFn
}: DraggableItemProps) {
  const { watch, setValue } = useFormContext<catalogoFormType>()

  const item = watch(`sections.${sectionIndex}.items.${itemIndex}`)

  const [open, setOpen] = useState(false)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [showCropper, setShowCropper] = useState(false)

  const inputRef = useRef<HTMLInputElement | null>(null)

  const localFormValues = useForm<itemFormType>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: { ...item }
  })

  const {
    register: localRegister,
    handleSubmit: localHandleSubmit,
    watch: localWatch,
    setValue: localSetValue,
    reset: localReset,
    formState: { errors }
  } = localFormValues

  const { image: localImage } = localWatch()

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

      if (localImage) {
        const filename = localImage.split('/').at(-1)

        if (filename) {
          await fetch(`/api/upload?filename=${filename}`, {
            method: 'DELETE'
          })
        }
      }

      const form = new FormData()
      const file = base64ToFile(cropped, 'image.jpg')

      form.append('file', file)
      form.append('slug', new ObjectId().toString())

      const response = await fetch(`/api/upload`, {
        method: 'POST',
        body: form
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao fazer upload')
      }

      const responseJSON: any = await response.json()

      localSetValue('image', responseJSON.url, { shouldValidate: true })

      setShowCropper(false)
      setImageSrc(null)
      setShowCropper(false)
      setImageSrc(null)
    } catch (err) {
      console.error(err)
    }
  }, [imageSrc, croppedAreaPixels, localSetValue])

  const onSubmit = (data: itemFormType) => {
    setValue(`sections.${sectionIndex}.items.${itemIndex}`, {
      ...data
    })
    localReset(data)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) {
      setImageSrc(null)
      setShowCropper(false)
    }
  }, [open])

  useEffect(() => {
    if (item && open) localReset(item)
  }, [open, item])

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: item?.id
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition
  }

  return (
    item?.id && (
      <FormProvider {...localFormValues}>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <div
              ref={setNodeRef}
              style={style}
              {...listeners}
              {...attributes}
              className={cn(
                'group flex flex-col w-full cursor-pointer rounded-xl bg-white overflow-hidden  hover:scale-[1.02] hover:bg-gray-5',
                isDragging && 'cursor-grabbing opacity-70'
              )}
            >
              <div className="relative w-full aspect-square bg-gray-50">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <Icon
                      icon="image-stack"
                      family="duotone"
                      className="text-gray-400 text-4xl"
                    />
                  </div>
                )}
              </div>
              <div className="flex flex-col flex-1 justify-between gap-4 p-2">
                <div className="space-y-1">
                  <p className="font-medium  line-clamp-2">{item.name}</p>
                  {item.description && (
                    <p className="text-gray-500 text-sm">{item.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 ">
                  {item.price && item.discountPrice ? (
                    <>
                      <p className="font-medium text-primary-500">{`R$${item.discountPrice}`}</p>
                      <p className="text-gray-500 text-sm line-through">{`R$${item.price}`}</p>
                    </>
                  ) : (
                    (item.price || item.discountPrice) && (
                      <p className="font-medium text-primary-500">{`R$${item.price || item.discountPrice}`}</p>
                    )
                  )}
                </div>
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="max-h-[90%] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar item</DialogTitle>
            </DialogHeader>

            <form onSubmit={localHandleSubmit(onSubmit)} className="space-y-4">
              <div className="flex flex-col gap-2 w-full items-center justify-center">
                <div
                  onClick={() => !showCropper && inputRef.current?.click()}
                  className={cn(
                    'relative flex items-center justify-center w-[300px] aspect-square overflow-hidden cursor-pointer rounded-md border-2 border-dashed',
                    errors.image
                      ? 'border-red-500 border-solid'
                      : 'border-dashed'
                  )}
                >
                  <Input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    onChange={onSelectFile}
                    className="hidden"
                  />

                  {localImage && !showCropper && (
                    <Image
                      src={localImage}
                      alt="Banner"
                      fill
                      className="object-cover"
                    />
                  )}

                  {!localImage && !showCropper && (
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
              <div className="flex gap-2">
                <DeleteModal
                  message="Você tem certeza que deja excluir o item?"
                  title="Excluir item"
                  trigger={
                    <Button
                      variant={'destructive'}
                      className="w-full"
                      leftIcon="trash-can"
                    >
                      Exluir item
                    </Button>
                  }
                  removeFn={removeFn}
                />
                <Button type="submit" className="w-full" leftIcon="save">
                  Atualizar item
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </FormProvider>
    )
  )
}
