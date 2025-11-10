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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import {
  InstantSearch,
  useInfiniteHits,
  useInstantSearch
} from 'react-instantsearch'

import { ProductItemList } from '@/features/builder/components/ProductItemList'

import { CustomSearch } from './CustomSearch'

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
      per_page: 8,
      sort_by: 'descricaoCompleta:asc'
    }
  })

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
        <DialogContent className="min-h-[90%] max-h-[90%] flex flex-col overflow-hidden p-0 gap-0">
          <DialogHeader className="flex-shrink-0 px-4 mt-4 mb-2">
            <DialogTitle>Selecionar produto</DialogTitle>
          </DialogHeader>

          <InstantSearch
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
            <div className="space-y-1 flex-shrink-0 px-4 border-b border-border pb-4 mt-4">
              <p className="font-medium text-sm">Busca</p>
              <CustomSearch />
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 px-4 pt-4">
              <InfiniteHits
                onItemClick={(hit: any) => {
                  setValue(`name`, hit.descricaoCompleta)
                  setValue(`image`, hit.imagem)
                  setOpen(false)
                }}
              />
            </div>
          </InstantSearch>
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

const InfiniteHits = ({ onItemClick }: { onItemClick: (hit: any) => void }) => {
  const { items, isLastPage, showMore } = useInfiniteHits()
  const sentinelRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)

  const handleLoadMore = useCallback(() => {
    if (!loadingRef.current && !isLastPage) {
      loadingRef.current = true
      showMore()
      setTimeout(() => {
        loadingRef.current = false
      }, 300)
    }
  }, [isLastPage, showMore])

  // Trigger initial load if sentinel is already visible
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || items.length === 0) return

    const checkVisibility = () => {
      const rect = sentinel.getBoundingClientRect()
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0

      if (isVisible && !isLastPage) {
        handleLoadMore()
      }
    }

    // Check after a small delay to ensure layout is ready
    const timer = setTimeout(checkVisibility, 100)
    return () => clearTimeout(timer)
  }, [items.length, isLastPage, handleLoadMore])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          handleLoadMore()
        }
      },
      {
        root: null, // Use viewport instead of scroll container
        rootMargin: '400px',
        threshold: 0
      }
    )

    observer.observe(sentinel)

    return () => observer.disconnect()
  }, [handleLoadMore])

  const productList = useMemo(
    () =>
      items.map((hit: any) => (
        <ProductItemList
          key={hit.objectID}
          item={hit}
          onClick={() => onItemClick(hit)}
        />
      )),
    [items, onItemClick]
  )

  if (items.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-10 text-gray-500 border rounded-md h-full">
        <p className="text-sm">Nenhum produto encontrado.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-1 gap-2">{productList}</div>

      {!isLastPage && (
        <div ref={sentinelRef} className="w-full py-4 text-center">
          <p className="text-sm text-gray-400">Carregando mais produtos...</p>
        </div>
      )}
    </div>
  )
}
