'use client'

import SearchInput from '@/components/SearchInput'
import { useState, useEffect, useCallback, useMemo } from 'react'

interface Product {
  id: string
  produto_base_nome: string
  descricao_comercial: string
  descricao_original: string
  cor: string
  tipo_produto: string
  tipo_embalagem: string
  altura_cm: string
  numero_hastes: string
  preco_venda_sugerido: number
  codigo_veiling: string
  ativo: boolean
}

interface SearchResponse {
  hits: Array<{ document: Product }>
  found: number
  facet_counts?: Array<{
    field_name: string
    counts: Array<{ value: string; count: number }>
  }>
}

export default function Page() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    cor: '',
    tipo_produto: '',
    tipo_embalagem: ''
  })
  const [sortBy, setSortBy] = useState('preco_venda_sugerido:asc')

  const handleChange = useMemo(
    () => (value: string) => {
      setQuery(value)
    },
    []
  )

  const searchProducts = useCallback(async () => {
    if (!query.trim()) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        q: query,
        query_by:
          'descricao_comercial,descricao_original,produto_base_nome,cor',
        per_page: '20',
        facet_by: 'cor,tipo_produto,tipo_embalagem',
        max_facet_values: '10',
        sort_by: sortBy
      })

      // Add filters
      const filterArray = []
      if (filters.cor) filterArray.push(`cor:${filters.cor}`)
      if (filters.tipo_produto)
        filterArray.push(`tipo_produto:${filters.tipo_produto}`)
      if (filters.tipo_embalagem)
        filterArray.push(`tipo_embalagem:${filters.tipo_embalagem}`)

      if (filterArray.length > 0) {
        params.append('filter_by', filterArray.join(' && '))
      }

      const response = await fetch(
        `http://localhost:8108/collections/conjuntos_comerciais/documents/search?${params}`,
        {
          headers: {
            'X-TYPESENSE-API-KEY': 'xyz'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data: SearchResponse = await response.json()
      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro na busca')
    } finally {
      setLoading(false)
    }
  }, [query, filters, sortBy])

  const clearFilters = useCallback(() => {
    setFilters({ cor: '', tipo_produto: '', tipo_embalagem: '' })
    setSortBy('preco_venda_sugerido:asc')
  }, [])

  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) {
        setResults(null)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          q: query,
          query_by:
            'descricao_comercial,descricao_original,produto_base_nome,cor',
          per_page: '20',
          facet_by: 'cor,tipo_produto,tipo_embalagem',
          max_facet_values: '10',
          sort_by: sortBy
        })

        const filterArray = []
        if (filters.cor) filterArray.push(`cor:${filters.cor}`)
        if (filters.tipo_produto)
          filterArray.push(`tipo_produto:${filters.tipo_produto}`)
        if (filters.tipo_embalagem)
          filterArray.push(`tipo_embalagem:${filters.tipo_embalagem}`)

        if (filterArray.length > 0) {
          params.append('filter_by', filterArray.join(' && '))
        }

        const response = await fetch(
          `http://localhost:8108/collections/conjuntos_comerciais/documents/search?${params}`,
          {
            headers: {
              'X-TYPESENSE-API-KEY': 'xyz'
            }
          }
        )

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data: SearchResponse = await response.json()
        setResults(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro na busca')
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(performSearch, 300)
    return () => clearTimeout(timer)
  }, [query, filters, sortBy])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🌸 Catálogo de Plantas e Flores - Teste Typesense
          </h1>
          <p className="text-gray-600">
            Busque por mais de 6.000 produtos usando busca inteligente e filtros
            avançados
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <SearchInput
              value={query}
              onChange={handleChange}
              onSearch={searchProducts}
              loading={loading}
            />
            <button
              onClick={searchProducts}
              disabled={loading || !query.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {loading ? '🔍' : 'Buscar'}
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filters.cor}
              onChange={e =>
                setFilters(prev => ({ ...prev, cor: e.target.value }))
              }
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Todas as cores</option>
              <option value="ROSA">Rosa</option>
              <option value="BRANCO">Branco</option>
              <option value="VERMELHO">Vermelho</option>
              <option value="AMARELO">Amarelo</option>
              <option value="LARANJA">Laranja</option>
              <option value="ROXO">Roxo</option>
              <option value="VARIADA">Variada</option>
            </select>

            <select
              value={filters.tipo_produto}
              onChange={e =>
                setFilters(prev => ({ ...prev, tipo_produto: e.target.value }))
              }
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Todos os tipos</option>
              <option value="FLOR">Flor</option>
              <option value="PLANTA">Planta</option>
            </select>

            <select
              value={filters.tipo_embalagem}
              onChange={e =>
                setFilters(prev => ({
                  ...prev,
                  tipo_embalagem: e.target.value
                }))
              }
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Todas embalagens</option>
              <option value="MACO">Maço</option>
              <option value="POTE">Pote</option>
              <option value="BANDEJA">Bandeja</option>
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="preco_venda_sugerido:asc">
                Preço: Menor → Maior
              </option>
              <option value="preco_venda_sugerido:desc">
                Preço: Maior → Menor
              </option>
              <option value="descricao_comercial:asc">Nome: A → Z</option>
              <option value="descricao_comercial:desc">Nome: Z → A</option>
            </select>
          </div>

          <button
            onClick={clearFilters}
            className="mt-4 px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
          >
            Limpar filtros
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">❌ {error}</p>
            <p className="text-red-600 text-sm mt-1">
              Verifique se o Typesense está rodando em localhost:8108
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Buscando produtos...</p>
          </div>
        )}

        {/* Results */}
        {results && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Facets Sidebar */}
            {results.facet_counts && (
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm border p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Filtros Disponíveis
                  </h3>

                  {results.facet_counts.map(facet => (
                    <div key={facet.field_name} className="mb-4">
                      <h4 className="font-medium text-gray-700 mb-2 capitalize">
                        {facet.field_name.replace('_', ' ')}
                      </h4>
                      <div className="space-y-1">
                        {facet.counts.slice(0, 5).map(count => (
                          <button
                            key={count.value}
                            onClick={() => {
                              setFilters(prev => ({
                                ...prev,
                                [facet.field_name]: count.value
                              }))
                            }}
                            className="block w-full text-left px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
                          >
                            {count.value || 'N/A'} ({count.count})
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Products Grid */}
            <div
              className={`${results.facet_counts ? 'lg:col-span-3' : 'lg:col-span-4'}`}
            >
              <div className="mb-4 flex justify-between items-center">
                <p className="text-gray-600">
                  <strong>{results.found.toLocaleString()}</strong> produtos
                  encontrados
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {results.hits.map(hit => (
                  <div
                    key={hit.document.id}
                    className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                  >
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {hit.document.descricao_comercial}
                      </h3>

                      <div className="text-sm text-gray-600 space-y-1 mb-3">
                        <p>
                          <span className="font-medium">Tipo:</span>{' '}
                          {hit.document.produto_base_nome}
                        </p>
                        {hit.document.cor && (
                          <p>
                            <span className="font-medium">Cor:</span>{' '}
                            {hit.document.cor}
                          </p>
                        )}
                        {hit.document.altura_cm && (
                          <p>
                            <span className="font-medium">Altura:</span>{' '}
                            {hit.document.altura_cm}cm
                          </p>
                        )}
                        {hit.document.numero_hastes && (
                          <p>
                            <span className="font-medium">Hastes:</span>{' '}
                            {hit.document.numero_hastes}
                          </p>
                        )}
                        <p>
                          <span className="font-medium">Embalagem:</span>{' '}
                          {hit.document.tipo_embalagem}
                        </p>
                        <p>
                          <span className="font-medium">Código:</span>{' '}
                          {hit.document.codigo_veiling}
                        </p>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-green-600">
                          R$ {hit.document.preco_venda_sugerido.toFixed(2)}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            hit.document.ativo
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {hit.document.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {results.hits.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    Nenhum produto encontrado
                  </p>
                  <p className="text-gray-400">
                    Tente ajustar sua busca ou filtros
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Search Examples */}
        {!results && !loading && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Exemplos de busca:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                'rosa vermelha',
                'lírio branco',
                'crisântemo',
                'phalaenopsis',
                'astromélia',
                'gerbera amarela'
              ].map(example => (
                <button
                  key={example}
                  onClick={() => setQuery(example)}
                  className="text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700"
                >
                  🔍 {example}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
