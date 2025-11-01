declare interface IAuditory {
  codigo: string
  created_at: string
  data_fim: string
  data_inicio: string
  descricao: string
  grupo_ferramenta: string
  grupo_ferramenta_gerencial_id?: {
    value: string
  }
  grupo_nivel_nota: string
  grupo_parametros_gerencial: string
  grupo_parametros_humana: string
  grupo_parametros_tecnica: string
  grupo_quadrante: string
  resultado_auditoria_humana_ugb?: any[]
  id: string
  passo: number
  situacao: number
  updated_at: string
  tipo: number
}

declare interface IPaginatedAuditories extends IPagination {
  data: IAuditory[]
}
