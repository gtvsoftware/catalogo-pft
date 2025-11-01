declare interface IInquiry {
  id: string
  tipo: number
  nome: string
  questions: IQuestions[]
}

declare interface IPaginatedInquiries extends IPagination {
  data: IInquiry[]
}

type IAnwsers = {
  id: string
  resposta: string
  valor: number
  length: number
  cor: string
  icone: string
}

type IQuestions = {
  id: string
  pergunta?: string
  pergunta_1: string
  pergunta_2: string
  pergunta_3: string
  length: number
  answers: [IAnwsers]
}
