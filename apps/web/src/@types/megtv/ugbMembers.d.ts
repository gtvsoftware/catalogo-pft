declare interface IUGBMember {
  id: string
  ugb_id: IUGB
  usuario_id: IUser
  data_entrada: string
  data_saida: string | null
  situacao: number
  tipo: number
  posição: number
  permissoes: null
  created_at: string
  updated_at: string
}

declare interface IPaginatedUGBMembers extends IPagination {
  data: IUGBMember[]
}
