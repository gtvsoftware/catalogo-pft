declare interface IUGB {
  id: string
  codigo: string
  nome: string
  missao: string
  situacao: number
  estrutura_pai_id: IStructure
  empresa_id: ICompany
  filial_id: ISubsidiary
  created_at: string
  updated_at: string
  ugbMembros: IUGBMember[]
  centro_custo_id: ICostCenter
  estrutura_pai?: {
    usuario_id: {
      avatar: string
    }
    usuarios: {
      avatar: string
    }
  }
}

declare interface IPaginatedUGBs extends IPagination {
  data: IUGB[]
}
