'use client'

import { getTypesenseSearchAdapter } from '@terraviva/typesense-catalogo-pft'
import { Icon } from '@terraviva/ui/icon'
import { FormProvider, useForm } from 'react-hook-form'
import { Configure, Hits, InstantSearch, Pagination } from 'react-instantsearch'

import { CustomSearch } from '@/components/CustomSearch'
import { GrupoSelect } from '@/components/GroupSelect'
import { ProductCard } from '@/components/ProductCard'
import { SerieSelect } from '@/components/SeriesSelect'

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
      per_page: 12
    }
  })

  return (
    <FormProvider {...formProps}>
      <InstantSearch
        indexName="variacoes"
        searchClient={typesenseInstantsearchAdapter.searchClient}
      >
        <div className="min-h-screen w-full">
          <div className="flex min-h-screen mx-auto gap-6 mt-4">
            <aside className="w-80 h-fit bg-white rounded-xl border border-gray-200 shadow-sm p-6 sticky top-6">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon icon="flower" className="w-5 h-5 text-emerald-600" />
                    <h1 className="text-lg font-semibold text-gray-900">
                      Catálogo
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
                      list: 'flex gap-4',
                      disabledItem: 'text-gray-300',
                      item: 'border border-border px-2 py-0.5 rounded-md flex justify-center'
                    }}
                  />
                </div>
              </div>
            </main>
          </div>
        </div>
      </InstantSearch>
    </FormProvider>
  )
}
