declare interface IUser {
  id: string
  usuario: string
  situacao: number
  nome_completo: string
  apelido: string | null
  avatar: string | null
  tipo: number
  empresa_id: ICompany
  filial_id: ISubsidiary
  created_at: number
  updated_at: number
  data_admissao?: string
}
declare interface IPaginatedUsers extends IPagination {
  data: IUser[]
}
