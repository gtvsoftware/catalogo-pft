declare interface IGeneratedInquiry {
  id: string
  usuario_avaliador_id: IUser
  usuario_avaliado_id: IUser
}

declare interface IPaginatedGeneratedInquiries extends IPagination {
  data: IGeneratedInquiry[]
}
