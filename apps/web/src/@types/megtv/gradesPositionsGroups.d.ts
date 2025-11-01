declare interface IGradePositionGroup {
  id: string
  nome: string
}

declare interface IPaginatedIGradePositionGroup extends IPagination {
  data: IGradePositionGroup[]
}
