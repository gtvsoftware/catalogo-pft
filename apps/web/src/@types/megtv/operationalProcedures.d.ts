declare interface IOperationalProcedure {
  id: string
  nome: string
  descricao: string
  ugb_id: IUGB
  situacao: number
  data_de_elaboracao: string
  data_de_validade: string
  created_at: string
  updated_at: string
  arquivos?: IOperationalProcedureFile[]
  tipo?: number
  data_de_revisao: string
}

declare interface IPaginatedOperationalProcedures extends IPagination {
  data: IOperationalProcedure[]
}
