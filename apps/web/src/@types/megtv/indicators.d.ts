declare interface IIndicator {
  id: string
  nome: string
  descricao: string
  ugb_id: string
  frequencia: number
  situacao: number
  tipo_medida: number
  tipo_indicador: number
  tipo_apontamento: number
  tipo_meta: number
  created_at: string
  updated_at: string
  appointments?: IIndicatorAppointment[]
  ugb: IUGB
  tipo_indicador: number
  campanha_qualidade_2023?: {
    nota?: number
  }[]
}

declare interface IIndicatorAppointment {
  id?: string
  maxima: number | null
  meta: number | null
  data: string
  valor: number
}

declare interface IPaginatedIndicators extends IPagination {
  data: IIndicator[]
  meta: IIndicator[]
  lastPage: number
  currentPage: number
}
