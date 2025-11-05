'use client'

import { Icon } from '@terraviva/ui/icon'
import { FormProvider, useForm } from 'react-hook-form'
import { Configure, Pagination, Hits } from 'react-instantsearch'
import TypesenseInstantSearchAdapter from 'typesense-instantsearch-adapter'
import { assembleTypesenseServerConfig } from '@/services/typesense/config'
import { ProductCard } from '@/components/ProductCard'
import { SerieSelect } from '@/components/SeriesSelect'
import { GrupoSelect } from '@/components/GroupSelect'
import { CustomSearch } from '@/components/CustomSearch'
import { InstantSearchNext } from 'react-instantsearch-nextjs'

// Initialize the Typesense Instantsearch adapter: https://github.com/typesense/typesense-instantsearch-adapter
const TYPESENSE_SERVER_CONFIG = assembleTypesenseServerConfig()
const typesenseInstantsearchAdapter = new TypesenseInstantSearchAdapter({
  server: TYPESENSE_SERVER_CONFIG,

  additionalSearchParameters: {
    //  So you can pass any parameters supported by the search endpoint below.
    //  queryBy is required.
    query_by: 'descricaoCompleta',
    per_page: 12
    // groupBy: "categories",
    // groupLimit: 1
    // pinnedHits: "23:2"
  }
})

// const transformItems = items => {
//   return items.sort((a, b) => (a.label > b.label ? 1 : -1))
// }

export default function FlowerCatalog() {
  const formProps = useForm({
    defaultValues: { grupo: null, serie: null }
  })

  const { watch } = formProps

  const grupo = watch('grupo')
  const serie = watch('serie')

  return (
    <FormProvider {...formProps}>
      <InstantSearchNext
        indexName="variacoes"
        searchClient={typesenseInstantsearchAdapter.searchClient}
      >
        <div className="min-h-screen w-full">
          <div className="flex min-h-screen mx-auto gap-6 p-6">
            {/* Sidebar */}
            <aside className="w-80 h-fit bg-white rounded-xl border border-gray-200 shadow-sm p-6 sticky top-6">
              <div className="space-y-6">
                {/* Header */}
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

                {/* Filters */}
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

                {/* Results Info */}
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 px-4">
              {/* Error Alert */}
              {/* {error && (
            <Alert variant="destructive" className="mb-6">
              <Icon icon="circle-exclamation" className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )} */}

              {/* Loading State */}
              {/* {loading.variacoes && (
            <div className="flex items-center justify-center py-20">
              <Icon
                icon="spinner-third"
                className="w-6 h-6 animate-spin text-emerald-600"
              />
            </div>
          )} */}

              {/* Variacoes Grid */}
              <div className="space-y-6">
                <div>
                  <Hits
                    classNames={{
                      list: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                    }}
                    hitComponent={({ hit }) => <ProductCard item={hit} />}
                  />
                </div>

                {/* Pagination */}

                <div className="pt-4">
                  <Pagination
                    classNames={{
                      list: 'flex gap-4',
                      disabledItem: 'text-gray-300',
                      item: 'border border-border px-2 py-0.5 rounded-md flex justify-center'
                      // pageItem:
                    }}
                  />
                </div>
              </div>
              {/* {!loading.variacoes && variacoes.length > 0 && (
         
          )} */}

              {/* Empty State */}
              {/* {!loading.variacoes && variacoes.length === 0 && selectedGrupo && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Icon icon="flower" className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-1">
                Nenhuma variação encontrada
              </h3>
              <p className="text-sm text-gray-500">Tente ajustar os filtros</p>
            </div>
          )} */}

              {/* Initial State */}
              {/* {!loading.variacoes && variacoes.length === 0 && !selectedGrupo && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <Icon icon="flower" className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-1">
                Selecione um grupo para começar
              </h3>
              <p className="text-sm text-gray-500">
                Use os filtros à esquerda para explorar o catálogo
              </p>
            </div>
          )} */}
            </main>
          </div>
        </div>
      </InstantSearchNext>
    </FormProvider>
  )
}
