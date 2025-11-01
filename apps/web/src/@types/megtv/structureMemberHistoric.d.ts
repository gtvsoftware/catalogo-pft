interface IStructureMemberHistoric {
  _id: string
  auditoryId: string
  structure: IStructure
  user: IUser
}

declare interface IPaginatedStructuresMembersHistoric {
  docs: IStructureMemberHistoric[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
  pagingCounter: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage: number
  nextPage: number
}
