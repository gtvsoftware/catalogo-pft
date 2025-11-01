declare interface ICompany {
  id: string
  nome: string
  codigo: string
  created_at: string
  updated_at: string
  sigla: string
  ordem: number
  icone?: string
  cor_destaque?: string
}

declare interface IPaginatedCompanies extends IPagination {
  data: ICompany[]
}
