'use client'

import { getTypesenseSearchAdapter } from '@terraviva/typesense-catalogo-pft'
import { cn } from '@terraviva/ui/cn'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@terraviva/ui/dialog'
import { Icon } from '@terraviva/ui/icon'
import { useEffect, useRef, useState } from 'react'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import {
  // Configure,
  // Hits,
  InstantSearch,
  useInfiniteHits,
  useInstantSearch
} from 'react-instantsearch'

import { ProductCardTeste } from '@/components/ProductCardTeste'

import { CustomSearch } from './CustomSearch'

// import { GrupoSelect } from './GroupSelect'
// import { SerieSelect } from './SeriesSelect'

interface ProductsModalProps {
  buttonClassName?: string
}

export function ProductsModal({ buttonClassName }: ProductsModalProps) {
  const { setValue } = useFormContext()

  const formProps = useForm({
    defaultValues: { grupo: null, serie: null }
  })

  const typesenseInstantsearchAdapter = getTypesenseSearchAdapter({
    additionalSearchParameters: {
      query_by: 'descricaoCompleta',
      per_page: 6,
      sort_by: 'descricaoCompleta:asc'
    }
  })

  // const { watch } = formProps
  // const { grupo, serie } = watch()
  const [open, setOpen] = useState(false)

  return (
    <FormProvider {...formProps}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            className={cn(
              'h-9 w-9 aspect-square justify-start items-center border rounded-md hover:bg-gray-100',
              buttonClassName
            )}
          >
            <Icon icon="magnifying-glass" className="text-sm" />
          </button>
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
                {/* <div className="flex  gap-2">
                  <div className="space-y-1 w-full">
                    <p className="font-medium text-sm">Grupo</p>
                    <GrupoSelect />
                  </div>
                  <div className="space-y-1 w-full">
                    <p className="font-medium text-sm">Série</p>
                    <SerieSelect />
                  </div>
                </div> */}
                {/* <Configure
                  filters={
                    grupo && serie
                      ? `grupoSlug:${grupo} && serieSlug:${serie}`
                      : grupo
                        ? `grupoSlug:${grupo}`
                        : ''
                  }
                /> */}
              </div>

              <div
                id="scroll-container"
                className="flex flex-col gap-2 h-full overflow-y-auto"
              >
                <InfiniteHits
                  onItemClick={(hit: any) => {
                    setValue(`name`, hit.descricaoCompleta)
                    setValue(`image`, hit.imagem)
                    setOpen(false)
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

// const CustomHits = ({ hitComponent }: { hitComponent: any }) => {
//   const { results } = useInstantSearch()
//   const hasResults = results && results.hits && results.hits.length > 0
//   if (!hasResults) {
//     return (
//       <div className="w-full flex flex-col items-center justify-center py-10 text-gray-500 border rounded-md h-full ">
//         <p className="text-sm">Nenhum produto encontrado.</p>
//       </div>
//     )
//   }
//   return <Hits hitComponent={hitComponent} />
// }

const InfiniteHits = ({ onItemClick }: { onItemClick: (hit: any) => void }) => {
  const { hits, isLastPage, showMore } = useInfiniteHits()
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sentinelRef.current || isLastPage) return

    const scrollContainer = document.getElementById('scroll-container')

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting && !isLastPage) {
          showMore()
        }
      },
      {
        root: scrollContainer,
        rootMargin: '100px',
        threshold: 0.1
      }
    )

    observer.observe(sentinelRef.current)

    return () => observer.disconnect()
  }, [isLastPage, showMore, hits.length])

  if (hits.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-10 text-gray-500 border rounded-md h-full">
        <p className="text-sm">Nenhum produto encontrado.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-1 gap-2">
        {hits.map((hit: any) => (
          <ProductCardTeste
            key={hit.objectID}
            item={hit}
            onClick={() => onItemClick(hit)}
          />
        ))}
      </div>

      {!isLastPage && (
        <div ref={sentinelRef} className="w-full py-4 text-center">
          <p className="text-sm text-gray-400">Carregando mais produtos...</p>
        </div>
      )}
    </div>
  )
}
