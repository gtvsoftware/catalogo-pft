'use client'

import { getTypesenseSearchAdapter } from '@terraviva/typesense-catalogo-pft'
import { Icon } from '@terraviva/ui/icon'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import {
  Configure,
  Hits,
  InstantSearch,
  Pagination,
  RefinementList,
  ToggleRefinement,
  useInstantSearch
} from 'react-instantsearch'

import { CustomSearch } from '@/components/CustomSearch'
import { GrupoSelect } from '@/components/GroupSelect'
import { ProductCard } from '@/components/ProductCard'
import { SerieSelect } from '@/components/SeriesSelect'

function ResetPageOnFilterChange({
  grupo,
  serie
}: {
  grupo: string | null
  serie: string | null
}) {
  const { setIndexUiState } = useInstantSearch()

  useEffect(() => {
    setIndexUiState(prevState => ({
      ...prevState,
      page: 1
    }))
  }, [grupo, serie, setIndexUiState])

  return null
}

export default function FlowerCatalog() {
  const formProps = useForm({
    defaultValues: { grupo: null, serie: null }
  })

  const { watch } = formProps

  const grupo = watch('grupo')
  const serie = watch('serie')

  const typesenseInstantsearchAdapter = getTypesenseSearchAdapter({
    additionalSearchParameters: {
      query_by: 'descricaoCompleta',
      per_page: 12,
      sort_by: 'descricaoCompleta:asc'
    }
  })

  return (
    <FormProvider {...formProps}>
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
        <div className="flex min-h-screen gap-6 mt-4 container mx-auto py-8 px-4">
          <aside className="w-80 h-fit bg-white rounded-xl border border-gray-200 shadow-sm p-6 sticky top-6">
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Icon icon="flower" className="w-5 h-5 text-emerald-600" />
                  <h1 className="text-lg font-semibold text-gray-900">
                    Todos os produtos
                  </h1>
                </div>
                <p className="text-sm text-gray-500">
                  Filtre por grupo e série
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                    Busca
                  </label>
                  <CustomSearch />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                    Grupo
                  </label>
                  <GrupoSelect />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                    Série
                  </label>
                  <SerieSelect />
                </div>

                <div>
                  <ToggleRefinement
                    classNames={{
                      root: 'flex items-center gap-2',
                      label:
                        'flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer',
                      checkbox:
                        'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
                      labelText: 'text-sm font-medium leading-none'
                    }}
                    className="mt-5"
                    attribute="has_image"
                    label="Apenas produtos com imagem"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                    Cor
                  </label>
                  <RefinementList
                    classNames={{
                      root: 'space-y-4',
                      noRefinementRoot: 'text-sm text-muted-foreground p-4',
                      searchBox: 'mb-3 hidden',
                      noResults: 'text-sm text-muted-foreground py-2 px-1',
                      list: 'space-y-2',
                      item: 'flex items-center space-x-2 py-1.5 px-1 rounded-md hover:bg-accent/50 transition-colors',
                      selectedItem: 'bg-accent',
                      label:
                        'flex items-center flex-1 cursor-pointer select-none',
                      checkbox:
                        'h-4 w-4 rounded border-input border ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
                      labelText:
                        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ml-2 flex-1',
                      count:
                        'ml-auto text-xs text-muted-foreground font-normal bg-muted px-2 py-0.5 rounded-full',
                      showMore:
                        'w-full mt-3 text-sm font-medium text-primary hover:text-primary/80 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md px-4 py-2 transition-colors',
                      disabledShowMore:
                        'opacity-50 cursor-not-allowed hover:bg-background hover:text-primary'
                    }}
                    className="mt-3"
                    attribute="cor"
                    limit={10}
                    showMore={true}
                    showMoreLimit={50}
                    searchable={true}
                    sortBy={['name:asc']}
                    // transformItems={transformItems}
                  />
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
              <ResetPageOnFilterChange grupo={grupo} serie={serie} />
            </div>
          </aside>

          <main className="flex-1 px-4">
            <div className="space-y-6">
              <div>
                <Hits
                  classNames={{
                    list: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                  }}
                  hitComponent={({ hit }) => <ProductCard item={hit} />}
                />
              </div>

              <div className="pt-4">
                <Pagination
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
                    link: 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground data-[selected=true]:hover:bg-primary data-[selected=true]:hover:text-primary-foreground'
                  }}
                />
              </div>
            </div>
          </main>
        </div>
      </InstantSearch>
    </FormProvider>
  )
}
