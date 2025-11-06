'use client'

import { PropsWithChildren } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

export default function Layout({
  children
}: PropsWithChildren): React.ReactElement {
  const formValues = useForm<catalogoFormType>({
    defaultValues: {
      title: 'Título',
      caption: 'Subtítulo',
      sections: []
    }
  })

  return <FormProvider {...formValues}>{children}</FormProvider>
}
