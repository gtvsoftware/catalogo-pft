'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, IconButton } from '@terraviva/ui/button'
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
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'

import { itemFormSchema } from '@/schemas/itemSchema'

import { ImageUpload } from '../../../components/ImageUpload'
import { ProductsModal } from './ProductsModal'

interface DraggableItemProps {
  sectionIndex: number
  itemIndex: number
  removeFn: () => void
  viewMode?: 'edit' | 'preview'
}

export function DraggableItem({
  sectionIndex,
  itemIndex,
  removeFn,
  viewMode = 'edit'
}: DraggableItemProps) {
  const { watch, setValue } = useFormContext<catalogoFormType>()

  const item = watch(`sections.${sectionIndex}.items.${itemIndex}`)
  const catalogId = watch('id')

  const handleDelete = async () => {
    if (item.image) {
      try {
        const filename = item.image.split('/').pop()
        if (filename) {
          await fetch(`/api/upload?filename=${filename}`, {
            method: 'DELETE'
          })
        }
      } catch (error) {
        console.error('Error deleting image:', error)
      }
    }

    removeFn()
  }

  const [open, setOpen] = useState(false)

  const [imageError, setImageError] = useState(false)
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

  const { image: localImage, additionalImages: localAdditionalImages } =
    localWatch()

  const onSubmit = (data: itemFormType) => {
    setValue(`sections.${sectionIndex}.items.${itemIndex}`, {
      ...data
    })
    localReset(data)
    setOpen(false)
  }

  useEffect(() => {
    if (item && open) localReset(item)
  }, [open, item])

  useEffect(() => {
    setImageError(false)
  }, [item?.image])

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

  const itemContent = (
    <div
      ref={viewMode === 'edit' ? setNodeRef : undefined}
      style={viewMode === 'edit' ? style : undefined}
      className={cn(
        'group relative flex flex-col w-full rounded-xl bg-white overflow-hidden p-2',
        viewMode === 'edit' &&
          'cursor-pointer hover:scale-[1.02] hover:bg-gray-5',
        isDragging && 'cursor-grabbing opacity-70'
      )}
    >
      {viewMode === 'edit' && (
        <IconButton
          variant="destructive"
          size="sm"
          icon="trash-can"
          onClick={e => {
            e.stopPropagation()
            handleDelete()
          }}
          className="absolute top-4 right-4 z-10"
          title="Excluir item"
        ></IconButton>
      )}

      <div
        {...(viewMode === 'edit' ? listeners : {})}
        {...(viewMode === 'edit' ? attributes : {})}
        className="relative w-full aspect-[3/4] bg-white overflow-hidden"
      >
        {item.image && !imageError ? (
          <Image
            src={item.image}
            alt={item.name || 'Produto'}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 p-4">
            <Icon
              icon="image-slash"
              variant="light"
              className="text-gray-400 text-3xl"
            />
            <span className="text-sm font-medium text-gray-500 mt-2">
              Produto sem imagem
            </span>
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
  )

  return (
    item?.id && (
      <FormProvider {...localFormValues}>
        {viewMode === 'edit' ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{itemContent}</DialogTrigger>
            <DialogContent className="w-[95vw] max-w-2xl h-[95vh] max-h-[900px] p-0 flex flex-col !gap-0">
              <DialogHeader className="px-4 py-3 sm:px-6 sm:py-4 border-b flex-shrink-0">
                <DialogTitle>Editar item</DialogTitle>
              </DialogHeader>

              <form
                onSubmit={localHandleSubmit(onSubmit)}
                className="flex flex-col flex-1 overflow-hidden"
              >
                <div className="flex-1 overflow-y-auto px-4 py-3 sm:px-6 sm:py-4 space-y-4">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                  <div className="space-y-2">
                    <p className="font-medium text-sm">Imagem principal *</p>
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-full max-w-sm">
                        <ImageUpload
                          enableCrop
                          cropAspect={3 / 4}
                          slug={item.id}
                          catalogId={catalogId}
                          value={localImage}
                          onChange={url =>
                            localSetValue('image', url, {
                              shouldValidate: true
                            })
                          }
                          onRemove={() =>
                            localSetValue('image', '', { shouldValidate: true })
                          }
                        />
                      </div>
                      {errors.image && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.image.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium text-sm">
                      Imagens adicionais (até 3)
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[0, 1, 2].map(index => (
                        <div key={index} className="w-full">
                          <ImageUpload
                            enableCrop
                            cropAspect={3 / 4}
                            slug={`${item.id}-additional-${index}`}
                            catalogId={catalogId}
                            value={localAdditionalImages?.[index] || ''}
                            onChange={url => {
                              const current = localAdditionalImages || []
                              const updated = [...current]
                              updated[index] = url
                              localSetValue(
                                'additionalImages',
                                updated.filter(Boolean),
                                { shouldValidate: true }
                              )
                            }}
                            onRemove={() => {
                              const current = localAdditionalImages || []
                              const updated = current.filter(
                                (_: string, i: number) => i !== index
                              )
                              localSetValue('additionalImages', updated, {
                                shouldValidate: true
                              })
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    {errors.additionalImages && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.additionalImages.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-t px-4 py-3 sm:px-6 sm:py-4 flex-shrink-0">
                  <Button type="submit" className="w-full" leftIcon="save">
                    Atualizar item
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        ) : (
          itemContent
        )}
      </FormProvider>
    )
  )
}
