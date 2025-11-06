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
  InstantSearch,
  Pagination,
  useInstantSearch
} from 'react-instantsearch'
import { SerieSelect } from '@/components/SeriesSelect'
import { CustomSearch } from '@/components/CustomSearch'
import { GrupoSelect } from '@/components/GroupSelect'
import { ProductCardTeste } from '@/components/ProductCardTeste'
import { getTypesenseSearchAdapter } from '@terraviva/typesense-catalogo-pft'
import { cn } from '@terraviva/ui/cn'

interface ProductsModalProps {
  label?: string
  buttonClassName?: string
}

export function ProductsModal({ buttonClassName, label }: ProductsModalProps) {
  const { setValue } = useFormContext()

  const formProps = useForm({
    defaultValues: { grupo: null, serie: null }
  })

  const typesenseInstantsearchAdapter = getTypesenseSearchAdapter({
    additionalSearchParameters: {
      query_by: 'descricaoCompleta',
      per_page: 12,
      sort_by: 'descricaoCompleta:asc'
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

            <InstantSearch
              routing
              indexName="variacoes"
              searchClient={typesenseInstantsearchAdapter.searchClient}
              initialUiState={{
                variacoes: {
                  toggle: {
                    has_image: true
                  }
                }
              }}
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
                        setValue(`image`, hit.imagem)
                        setOpen(false)
                      }}
                    />
                  )}
                />

                <Pagination
                  padding={2}
                  classNames={{
                    root: 'flex items-center justify-center',
                    noRefinementRoot:
                      'flex items-center justify-center opacity-50 cursor-not-allowed',
                    list: 'flex items-center gap-1',
                    item: 'inline-flex items-center justify-center',
                    firstPageItem: 'inline-flex items-center justify-center',
                    previousPageItem: 'inline-flex items-center justify-center',
                    pageItem: 'inline-flex items-center justify-center',
                    selectedItem:
                      'inline-flex items-center justify-center text-primary-500',
                    disabledItem:
                      'inline-flex items-center justify-center opacity-50 cursor-not-allowed pointer-events-none',
                    nextPageItem: 'inline-flex items-center justify-center',
                    lastPageItem: 'inline-flex items-center justify-center',
                    link: 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground data-[selected=true]:hover:bg-primary data-[selected=true]:hover:text-primary-foreground'
                  }}
                />
              </div>
            </InstantSearch>
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
