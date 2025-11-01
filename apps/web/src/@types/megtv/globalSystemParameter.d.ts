interface IGlobalSystemParameter {
  name: string
  description: string
  situation: number
  fields: IField[]
}

interface IField {
  name: string
  type: string
  value: number
}

declare interface IPaginatedGlobalSystem extends IPagination {
  data: IGlobalSystemParameter[]
}
