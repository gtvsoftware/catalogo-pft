declare interface IStructurePosition {
  id: string
  nome: string
  created_at: string
  updated_at: string
}

declare interface StructurePositions {
  id: string
  nome: string
  nivelAcimaId: string | null
  profundidade: number
  descricao: string
  created_at: Date
  updated_at: Date
  deleted_at: Date | null
}
