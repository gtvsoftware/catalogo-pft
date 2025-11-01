declare interface IIndicatorAppointmentProductivity {
  id: string
  indicador_id: string
  valor: string
  data_apontamento: string
  responsavel_id: string
  observacao: string | null
  indicador_lancamentos_apurado_id: string
  total_horas?: string
  media_hora_pessoa?: string
  quantidade_produzida?: number
  created_at: string
  updated_at: string
  deleted_at: null
  indicadores_apontamentos_produtividade_detalhes: IIndicatorAppointmentProductivityDetails[]
  usuarios?: IUser
}

declare interface IIndicatorAppointmentProductivityDetails {
  id: string
  indicadores_apontamento_produtividade_id: string
  quantidade_pessoas: number
  quantidade_produzida: string
  valor: string
  total_horas: string
  data_inicio: string
  data_fim: string
  intervalo: string
  observacao: string
  created_at: string
  updated_at: string
  deleted_at: null
}
