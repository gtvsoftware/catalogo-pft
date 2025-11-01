export interface IUgbDTO {
  id: string
  nome: string
  empresa: string
  type: string
}

export interface IStructureDTO {
  id: string
  nome: string
  empresa: string
  estrutura_pai_id: string | null
  nota: {
    valor: number | string | null
    cor?: string
  }
  funcao?: string
  avatar?: string | null
  type?: string
  indicator?: {
    id: string
    tipo_apontamento: number
  }
  childrens?: IStructureDTO[]
}
