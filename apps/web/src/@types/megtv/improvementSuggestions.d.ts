declare interface IImprovementSuggestion {
  id: string
  codigo: string
  usuario_id: IUser
  ugb_id: IUGB
  sugestao: string
  processo_atual: string
  processo_novo: string
  ganho: string
  tipo_ganho: any
  valor: number
  data_retorno: string
  data_implantacao: string
  parecer_lider: string
  situacao: number
  created_at: string
  classificacao: number
  updated_at: string
}

declare interface IImprovementSuggestionInteractionsProps {
  id: string
  mensagem: string
  nova_classificacao: number
  nova_situacao: number
  sort?: any
}

declare interface IPaginatedImprovementSuggestion extends IPagination {
  data: IImprovementSuggestion[]
}
