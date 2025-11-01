import { api } from './api'

export interface SuggestionItem {
  id: string
  sugestao: string
  ugb_id?: {
    nome: string
  }
  created_at: string
  updated_at: string
  situacao: string
}

export interface SuggestionsResponse {
  data: SuggestionItem[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface SuggestionsParams {
  term?: string
  page?: number
  order?: 'ASC' | 'DESC'
  sort?: string
  per_page?: number
}

export const fetchUserSuggestions = async (
  params: SuggestionsParams
): Promise<SuggestionsResponse> => {
  const searchParams = new URLSearchParams()

  if (params.term) searchParams.append('term', params.term)
  if (params.page) searchParams.append('page', String(params.page))
  if (params.order) searchParams.append('order', params.order)
  if (params.sort) searchParams.append('sort', params.sort)
  if (params.per_page) searchParams.append('per_page', String(params.per_page))

  const { data } = await api.get(
    `/core/admin/suggestion?${searchParams.toString()}`
  )
  return data
}
