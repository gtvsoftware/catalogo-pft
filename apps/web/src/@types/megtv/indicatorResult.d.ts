declare interface IIndicatorResult {
  id: string
  indicador_id: string
  valor: string
  data_apuracao: string
  quantidade_apurado: 2
  operacao?: number | null
  created_at: string
  updated_at: string
  questionnaire?: {
    nome?: string
  }
  deleted_at: string | null
  indicador_checklist_id: null
  meta?: {
    meta: number
    data: string
    maxima: number
    valor: number
    id: string
  }
  indicadores_lancamentos: IIndicatorAppointmentManual[]
  indicadores_apontamentos_checklist: IIndicatorAppointmentChecklist[]
  indicadores_apontamentos_produtividade: IIndicatorAppointmentProductivity[]

  lancamento_apurado_id?: string
  indicadores_lancamentos_apurado_detalhes: {
    id: string
    indicador_id: string
    lancamento_apurado_id: string
    total_horas: string
    media_hora_pessoa: string
    quantidade_produzida: string
    created_at: string
    updated_at: string
    deleted_at: string | null
  }[]
  other_indicadores_lancamentos_apurado: IIndicatorResult[]
}

declare interface IIndicatorResultsPaginatedProps {
  data: IIndicatorResult[]
  last_page: number
  per_page: number
  total: number
  current_page: number
}
