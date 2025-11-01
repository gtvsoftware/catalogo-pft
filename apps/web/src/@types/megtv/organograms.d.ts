declare interface IOrganogram {
  id: string
  tipo_medida?: string
  frequencia?: string
  situacao?: number
  meta: number
  tipo_apontamento?: number
  tipo_meta?: number
  capacidade?: number
  capacidade_maxima?: number
  data_inicio?: Date
  data_fim?: Date
  ugb?: {
    id: string
    nome: string
    estrutura_pai?: {
      usuarios?: {
        nome_completo?: string
        apelido?: string
        avatar: string
      }
    }
  }
}

declare interface IPaginatedOrganogram extends IPaginationMeta {
  meta: IOrganogram[]
  data: IOrganogram[]
  lastPage: number
  currentPage: number
}
