type AnswerProps = {
  id: string
  resposta: string
  valor: number
  length: number
}

type QuestionsProps = {
  id: string
  pergunta_1: string
  pergunta_2: string
  pergunta_3: string
  length: number
  answers: [AnswerProps]
}

type UserProps = {
  apelido: string
  nome_completo: string
  avatar: string
  usuario: string
}
type PesqProps = {
  questions: [QuestionsProps]
  nome: string
}

type EvaluationsProps = {
  id: string
  usuario_avaliado_id: UserProps
  usuario_avaliador_id: UserProps
  pesquisa_id: PesqProps
  status: number
}

declare interface IEvaluation {
  id: string
  estrutura_avaliado_id: IStructure | null
  estrutura_avaliador_id: IStructure | null
  auditoria_id: IAuditory
  controle_id: string
  pesquisa_id: IInquiry
  ugb_id: IUGB
  usuario_avaliado_id: IUser
  usuario_avaliador_id: IUser
  tipo: 'LIDER' | 'LIDERADO' | 'AUTO'
  status: number
  created_at: string
  updated: string
}

declare interface ICustomEvaluationsList {
  usuario_id: string
  nome_completo: string
  apelido: string | null
  avatar: string | null
  ugb: string | null
  estrutura: string | null
  count: number
  row: number
  avaliacoes?: IEvaluation[]
  pendente: number
  respondida: number
  total: number
  porcentagem: number
}

declare interface IPaginatedEvaluationsCustom {
  data: ICustomEvaluationsList[]
  from: number
  to: number
  total: number
  current_page: number
  per_page: number
  prev_page: number
  next_page: number
  last_page: number
}
