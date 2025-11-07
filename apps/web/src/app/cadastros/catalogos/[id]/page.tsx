'use client'

import { Icon } from '@terraviva/ui/icon'
import { FormProvider, useFieldArray, useForm } from 'react-hook-form'
import { v4 as randomUUID } from 'uuid'

import { Banner } from '../../../../components/banner/Banner'
import { Section } from '@/components/Section'
import { Button, LoadingSpinner } from '@terraviva/ui/button'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Page(): React.ReactElement {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)

  const formValues = useForm<catalogoFormType>({
    defaultValues: {
      id: randomUUID(),
      title: 'Título',
      caption: 'Subtítulo',
      sections: []
    }
  })

  const { control, watch, handleSubmit, formState, reset } = formValues

  const { append } = useFieldArray({
    name: 'sections',
    control
  })

  const { sections } = watch()

  const handleSection = () => {
    const section: sectionFormType = {
      id: randomUUID(),
      title: `Seção ${sections.length + 1}`,
      items: []
    }

    append(section)
  }

  const NewSectionButton = () => (
    <div
      className="w-full border-2 border-dashed min-h-64 flex flex-col items-center justify-center  bg-gray-100 rounded-md cursor-pointer gap-2"
      onClick={handleSection}
    >
      <Icon icon="plus-circle" className="text-primary-500 text-2xl" />
      <p className="font-medium">Nova seção</p>
    </div>
  )

  useEffect(() => {
    if (id && id !== 'novo') {
      const fetchCatalogo = async () => {
        const res = await fetch(`/api/catalogos/${id}`)
        if (res.ok) {
          const catalogo = await res.json()
          reset(catalogo)
          setLoading(false)
        }
      }
      fetchCatalogo()
    } else {
      setLoading(false)
    }
  }, [id])

  const onSubmit = async (data: catalogoFormType) => {
    try {
      const formData = new FormData()
      formData.append('data', JSON.stringify(data))

      const isEdit = id && id !== 'novo'
      const url = isEdit ? `/api/catalogos/${id}` : '/api/catalogos'
      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        body: formData
      })

      if (!response.ok) {
        throw new Error(
          isEdit ? 'Erro ao atualizar catálogo' : 'Erro ao criar catálogo'
        )
      }

      const result = await response.json()
      console.log(
        `Catálogo ${isEdit ? 'atualizado' : 'criado'} com sucesso:`,
        result
      )
    } catch (error) {
      console.error('Erro ao enviar catálogo:', error)
    }
  }
  return loading ? (
    <div className="w-screen h-full">
      <LoadingSpinner />
    </div>
  ) : (
    <FormProvider {...formValues}>
      <div className="w-screen flex justify-center">
        <div className="flex flex-col items-center gap-8 max-w-[800px] w-full">
          <Banner />
          {!!sections.length && (
            <div className="flex flex-col gap-8 w-full">
              {sections.map((section, index) => (
                <Section key={section.id} sectionIndex={index} />
              ))}
            </div>
          )}
          <NewSectionButton />
          <Button
            disabled={!formState.isDirty}
            className="w-full"
            type="button"
            leftIcon="save"
            onClick={handleSubmit(onSubmit)}
          >
            {id && id !== 'novo' ? 'Editar' : 'Criar'} catálogo
          </Button>
        </div>
      </div>
    </FormProvider>
  )
}
