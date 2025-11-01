declare interface ISuggestions {
  id: string
  usuario_id: UsersProps
  ugb_id: UgbProps
  sugestao: string
  processo_atual: string
  processo_novo: string
  ganho: string
  tipo_ganho: any
  parecer_lider: string
  situacao: number
  created_at: string
  updated_at: string
  classificacao: number
  valor: number
  data_implantacao: string
  codigo: number
  data_retorno: string
  sugestoes_melhoria_arquivos?: any[]
  sugestoes_melhoria_interacoes?: any[]
  usuarios?: IUser
}

declare interface IPaginatedSuggestions {
  from: number
  to: number
  per_page: number
  total: number
  current_page: number
  prev_page?: number | null | undefined
  next_page?: number | null | undefined
  last_page: number
  data: ISuggestions[] | []
}
