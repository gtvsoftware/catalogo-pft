'use client'

import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@terraviva/ui/dialog'
import { useEffect, useState } from 'react'
import { Button } from '@terraviva/ui/button'
import {
  Configure,
  Hits,
  Pagination,
  useInstantSearch
} from 'react-instantsearch'
import { SerieSelect } from '@/components/SeriesSelect'
import { CustomSearch } from '@/components/CustomSearch'
import { GrupoSelect } from '@/components/GroupSelect'
import { InstantSearchNext } from 'react-instantsearch-nextjs'
import { ProductCardTeste } from '@/components/ProductCardTeste'
import TypesenseInstantsearchAdapter from 'typesense-instantsearch-adapter'
import { cn } from '@terraviva/ui/cn'
import { assembleTypesenseServerConfig } from '@terraviva/typesense-catalogo-pft'

interface ProductsModalProps {
  label?: string
  buttonClassName?: string
}

export function ProductsModal({ buttonClassName, label }: ProductsModalProps) {
  const { setValue } = useFormContext()

  const formProps = useForm({
    defaultValues: { grupo: null, serie: null }
  })

  const TYPESENSE_SERVER_CONFIG = assembleTypesenseServerConfig()

  const typesenseInstantsearchAdapter = new TypesenseInstantsearchAdapter({
    server: TYPESENSE_SERVER_CONFIG,

    additionalSearchParameters: {
      query_by: 'descricaoCompleta',
      per_page: 12
    }
  })

  const { watch } = formProps
  const { grupo, serie } = watch()
  const [open, setOpen] = useState(false)

  return (
    <FormProvider {...formProps}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant={'outline'}
            leftIcon="magnifying-glass"
            className={cn('w-full justify-start items-center', buttonClassName)}
          >
            {label || 'Selecionar produto'}
          </Button>
        </DialogTrigger>
        <DialogContent className="min-h-[90%] max-h-[90%] overflow-y-auto">
          <div className="flex flex-col gap-4 justify-start h-full">
            <DialogHeader>
              <DialogTitle>Selecionar produto</DialogTitle>
            </DialogHeader>

            <InstantSearchNext
              indexName="variacoes"
              searchClient={typesenseInstantsearchAdapter.searchClient}
            >
              <SearchRefresher open={open} />
              <div className="space-y-2 w-full">
                <div className="space-y-1">
                  <p className="font-medium text-sm">Busca</p>
                  <CustomSearch />
                </div>
                <div className="flex  gap-2">
                  <div className="space-y-1 w-full">
                    <p className="font-medium text-sm">Grupo</p>
                    <GrupoSelect />
                  </div>
                  <div className="space-y-1 w-full">
                    <p className="font-medium text-sm">Série</p>
                    <SerieSelect />
                  </div>
                </div>
                <Configure
                  filters={
                    grupo && serie
                      ? `grupoSlug:${grupo} && serieSlug:${serie}`
                      : grupo
                        ? `grupoSlug:${grupo}`
                        : ''
                  }
                />
              </div>

              <div className="flex flex-col gap-2 items-center h-full">
                <CustomHits
                  hitComponent={({ hit }: any) => (
                    <ProductCardTeste
                      item={hit}
                      onClick={() => {
                        setValue(`name`, hit.descricaoCompleta)
                        setValue(`commercialName`, hit.descricaoComercial)
                        setValue(`color`, hit.cor)
                        setValue(`height`, hit.alturaCm)
                        setOpen(false)
                      }}
                    />
                  )}
                />

                <Pagination
                  padding={2}
                  classNames={{
                    list: 'flex gap-2',
                    disabledItem: 'text-gray-300',
                    item: 'border rounded-md flex justify-center items-center text-sm font-medium w-10 h-10',
                    selectedItem: 'bg-primary-500 text-white '
                  }}
                />
              </div>
            </InstantSearchNext>
          </div>
        </DialogContent>
      </Dialog>
    </FormProvider>
  )
}

const SearchRefresher = ({ open }: { open: boolean }) => {
  const { refresh } = useInstantSearch()

  useEffect(() => {
    if (open) {
      refresh()
    }
  }, [open, refresh])

  return null
}

const CustomHits = ({ hitComponent }: { hitComponent: any }) => {
  const { results } = useInstantSearch()
  const hasResults = results && results.hits && results.hits.length > 0
  if (!hasResults) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-10 text-gray-500 border rounded-md h-full ">
        <p className="text-sm">Nenhum produto encontrado.</p>
      </div>
    )
  }
  return (
    <Hits
      classNames={{ list: 'grid grid-cols-3 gap-2' }}
      hitComponent={hitComponent}
    />
  )
}
