declare interface IUGBTransfers {
  id: string
  situacao: number
  nova_ugb: IUGB
  data_aceite: string
  data_agendamento: string
  membro_ugb_id: IUGBMember
  usuario_solicitacao_id: IUser
  usuario_aprovacao_id: IUser
  usuario_acao_id: IUser
  avisar_dp: boolean
  updated_at: string
}

declare interface IPaginatedUGBTransfers extends IPagination {
  data: IUGBTransfers[]
}
