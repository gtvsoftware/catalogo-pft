type Target = {
  id: string
  nome: string
}

declare interface AnnouncementResponseDTO {
  id: string
  titulo: string
  conteudo: string
  tipo: string
  created_at: Date
  updated_at: Date
  destinatarios: {
    id: string
    todaEmpresa: boolean
    empresas: Target[]
    niveisEstruturas: Target[]
    filiais: Target[]
    estruturas: Target[]
    ugbs: Target[]
    created_at: Date
    updated_at: Date
  }
}

declare interface CreateAnnouncementDTO {
  id?: string
  titulo: string
  conteudo: string
  tipo: string
  destinatarios: {
    id?: string
    todaEmpresa?: boolean
    niveisEstruturasIds?: string[]
    filiaisIds?: string[]
    empresasIds?: string[]
    estruturasIds?: string[]
    ugbsIds?: string[]
    created_at?: Date
    updated_at?: Date
  }
  created_at?: Date
  updated_at?: Date
}

declare interface UpdateAnnouncementDTO {
  id: string
  titulo: string
  conteudo: string
  tipo: string
  destinatarios?: {
    id?: string
    todaEmpresa?: boolean
    niveisEstruturasIds?: string[]
    filiaisIds?: string[]
    empresasIds?: string[]
    ugbsIds?: string[]
    estruturasIds?: string[]
    created_at?: Date
    updated_at?: Date
  }
  created_at?: Date
  updated_at?: Date
}
