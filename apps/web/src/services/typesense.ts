// Configuração do cliente Typesense para o browser
const TYPESENSE_CONFIG = {
  host: 'localhost',
  port: 8108,
  protocol: 'http',
  apiKey: 'xyz'
}

// Tipos para os produtos
export interface Product {
  id: string
  produto_base_nome: string
  descricao_comercial: string
  descricao_original: string
  cor?: string
  tipo_produto: string
  tipo_embalagem: string
  altura_cm?: string
  numero_hastes?: string
  preco_venda_sugerido: number
  codigo_veiling: string
  ativo: boolean
}

export interface SearchResponse {
  hits: Array<{ document: Product }>
  found: number
  facet_counts?: Array<{
    field_name: string
    counts: Array<{ value: string; count: number }>
  }>
}

// Função helper para busca usando fetch API
export async function searchProducts(
  query: string,
  filters: Record<string, string> = {},
  sortBy: string = 'preco_venda_sugerido:asc',
  perPage: number = 20
): Promise<SearchResponse> {
  const params = new URLSearchParams({
    q: query,
    query_by: 'descricao_comercial,descricao_original,produto_base_nome,cor',
    per_page: perPage.toString(),
    facet_by: 'cor,tipo_produto,tipo_embalagem',
    max_facet_values: '10',
    sort_by: sortBy
  })

  // Adicionar filtros
  const filterArray = []
  for (const [field, value] of Object.entries(filters)) {
    if (value) {
      filterArray.push(`${field}:${value}`)
    }
  }

  if (filterArray.length > 0) {
    params.append('filter_by', filterArray.join(' && '))
  }

  const response = await fetch(`${TYPESENSE_CONFIG.protocol}://${TYPESENSE_CONFIG.host}:${TYPESENSE_CONFIG.port}/collections/conjuntos_comerciais/documents/search?${params}`, {
    headers: {
      'X-TYPESENSE-API-KEY': TYPESENSE_CONFIG.apiKey
    }
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  return await response.json()
}

// Função para buscar por facetas (para autocomplete de filtros)
export async function getFacetValues(field: string): Promise<string[]> {
  try {
    const params = new URLSearchParams({
      q: '*',
      query_by: 'descricao_comercial',
      per_page: '0',
      facet_by: field,
      max_facet_values: '50'
    })

    const response = await fetch(`${TYPESENSE_CONFIG.protocol}://${TYPESENSE_CONFIG.host}:${TYPESENSE_CONFIG.port}/collections/conjuntos_comerciais/documents/search?${params}`, {
      headers: {
        'X-TYPESENSE-API-KEY': TYPESENSE_CONFIG.apiKey
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    const facetCounts = data.facet_counts?.find((f: any) => f.field_name === field)
    return facetCounts?.counts.map((c: any) => c.value) || []
  } catch (error) {
    console.error('Error fetching facet values:', error)
    return []
  }
}

// Função para sugestões de busca
export async function getSuggestions(query: string): Promise<string[]> {
  if (query.length < 2) return []

  try {
    const params = new URLSearchParams({
      q: query,
      query_by: 'descricao_comercial,produto_base_nome',
      per_page: '5',
      typo_tokens_threshold: '1',
      drop_tokens_threshold: '0'
    })

    const response = await fetch(`${TYPESENSE_CONFIG.protocol}://${TYPESENSE_CONFIG.host}:${TYPESENSE_CONFIG.port}/collections/conjuntos_comerciais/documents/search?${params}`, {
      headers: {
        'X-TYPESENSE-API-KEY': TYPESENSE_CONFIG.apiKey
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return data.hits.map((hit: any) => hit.document.descricao_comercial)
  } catch (error) {
    console.error('Error fetching suggestions:', error)
    return []
  }
}
