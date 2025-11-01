declare interface IUserRewardsList {
  usuario_id: string
  nome_completo: string
  apelido: string | null
  avatar: string | null
  ugb: string | null
  estrutura: string | null
  meses: number
  valor: number
}

declare interface IUserReward {
  usuario_id: string
  nome_completo: string
  apelido: string
  avatar: string
  ugb: string
  estrutura: string
  mes: string
  valor_calculado: number
  valor_pagar: number
  meta_estrutura: number
  meta_ugb: number
  nivel_nota: string
  cor_nota: string
  dias_trabalhados: number
}

declare interface IPaginatedUserRewards {
  data: IUserRewardsList[]
  from: number
  to: number
  total: number
  current_page: number
  per_page: number
  prev_page: number
  next_page: number
  last_page: number
}
