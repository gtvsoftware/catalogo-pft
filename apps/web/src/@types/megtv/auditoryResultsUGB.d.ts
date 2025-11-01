declare interface IAuditoryResultsUGB {
  id: string
  auditoria_id: IAuditory
  ugb_id: IUGB
  responsavel_id: IUser
  nivel_nota: IGradePosition
  tipo: string
  nota: number
  created_at: string
  nota_t?: number
  nota_g?: number
  nota_h?: number
}

declare interface IPaginatedAuditoryResultsUGB extends IPagination {
  data: IAuditoryResultsUGB[]
}
