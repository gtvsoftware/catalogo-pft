declare interface IStructure {
  id: string
  profundidade: number
  usuario_id: IUser
  estrutura_pai_id: IStructure | null
  empresa_id: ICompany
  filial_id: ISubsidiary
  nivel_estrutura_id: IStructurePosition
  ugbs: IUGB[]
  children: IStructure[]
  created_at: string
  updated_at: string
}
