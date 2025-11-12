'use client'

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
import { ObjectId } from 'bson'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { itemFormSchema } from '@/schemas/itemSchema'

import { ImageUpload } from '../../../components/ImageUpload'
import { ProductsModal } from './ProductsModal'

interface CreateItemFormModalProps {
  append: (item: itemFormType) => void
  catalogId: string
}

export function CreateItemFormModal({
  append,
  catalogId
}: CreateItemFormModalProps) {
  const [open, setOpen] = useState(false)

  const formValues = useForm<itemFormType>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      id: new ObjectId().toString(),
      name: '',
      description: '',
      price: '',
      discountPrice: '',
      image: '',
      additionalImages: []
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

  const { image: localImage, additionalImages: localAdditionalImages } =
    localWatch()

  const onSubmit = (data: itemFormType) => {
    append({
      ...data
    })
    setOpen(false)
  }

  useEffect(() => {
    if (!open) {
      localReset({
        id: new ObjectId().toString(),
        name: '',
        description: '',
        price: '',
        discountPrice: '',
        image: '',
        additionalImages: []
      })
    }
  }, [open, localReset])

  return (
    <FormProvider {...formValues}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div className="p-4">
            <div className="border-2 h-64 cursor-pointer border-dashed gap-4  w-full flex flex-col items-center justify-center bg-gray-100 rounded-md">
              <Icon icon="plus" className="text-gray-500 text-xl" />
              <p className="font-medium text-gray-500 text-sm text-center max-w-36">
                Clique para adicionar um novo item
              </p>
            </div>
          </div>
        </DialogTrigger>

        <DialogContent className="w-[95vw] max-w-2xl h-[95vh] max-h-[900px] p-0 flex flex-col">
          <DialogHeader className="px-4 py-3 sm:px-6 sm:py-4 border-b flex-shrink-0">
            <DialogTitle>Novo item</DialogTitle>
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
                      slug={formValues.getValues('id')}
                      catalogId={catalogId}
                      value={localImage}
                      onChange={url =>
                        localSetValue('image', url, { shouldValidate: true })
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
                        slug={`${formValues.getValues('id')}-additional-${index}`}
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
                          const updated = current.filter((_, i) => i !== index)
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
              <Button type="submit" className="w-full" leftIcon="plus">
                Adicionar item
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </FormProvider>
  )
}
