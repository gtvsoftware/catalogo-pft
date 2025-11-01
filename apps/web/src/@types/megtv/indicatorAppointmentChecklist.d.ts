interface IIndicatorAppointmentChecklist {
  id: string
  indicador_id: string
  indicador_checklist_id: string
  valor: string
  percentual: string
  created_at: string
  updated_at: string
  deleted_at: string | null
  observacao: string | null
  numero_percentual: string
  data_apontamento: string
  responsavel_id: string
  indicador_lancamentos_apurado_id: string
  usuarios: IUser
  indicadores_checklist_respostas: IIndicatorAppointmentsChecklistQuestions[]
}
interface IIndicatorAppointmentManual {
  id: string
  indicador_id: string
  valor: string
  created_at: string
  updated_at: string
  deleted_at: string | null
  observacao: string | null
  data_lancamento: string
  responsavel_id: string
  indicador_lancamentos_apurado_id: string
  usuarios: IUser
  indicadores_checklist_respostas: IIndicatorAppointmentsChecklistQuestions[]
}

interface IIndicatorAppointmentIntegrationSimple {
  id: string
  indicador_id: string
  valor: string
  created_at: string
  updated_at: string
  deleted_at: string | null
  observacao: string | null
  data_apuracao: string
  indicador_lancamentos_apurado_id: string
  usuarios: IUser
}

interface IIndicatorAppointmentsChecklistQuestions {
  id: string
  indicador_checklist_id: string
  indicador_checklist_pergunta_id: string
  valor: string
  created_at: string
  updated_at: string
  deleted_at: string | null
  data_resposta: string
  indicador_apontamento_checklist_id: string
  indicador_checklist_pergunta: IIndicatorAppointmentChecklistAnswer
}

interface IIndicatorAppointmentChecklistAnswer {
  id: string
  indicador_checklist_id: string
  pergunta: string
  peso: string
  created_at: string
  updated_at: string
  deleted_at: string | null
  ordem: number
  padrao: string | null
  tipo: number
}
