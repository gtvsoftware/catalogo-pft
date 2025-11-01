declare interface IInquiryControl {
  id: string
  status: number
  total: number
  geradas: number
  situacao: number
  data_inicio: string
  data_fim: string
  data_gerada: string
  pesquisa_id: IInquiry
  auditoria_id: IAuditory
}

declare interface IPaginatedInquiriesControl extends IPagination {
  data: IInquiryControl[]
}
