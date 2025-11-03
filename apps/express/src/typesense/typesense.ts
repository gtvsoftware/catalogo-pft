type ProdutoBase = {
  id: string
  produto_base: string
  tipo_produto: string
  descricao: string
  status: string
  galeria_principal: string[]
  created_at: string
  updated_at: string
}

type ConjuntoComercial = {
  id: string
  produto_id: string
  variedade: string | null
  nivel_comercial: string | null
  tipo_produto: string
  tipo_embalagem: string
  numero_pote: string | null
  numero_hastes: string | null
  numero_flores: string | null
  altura_cm: string | null
  diametro_flor_cm: string | null
  gramas: string | null
  cor: string | null
  codigo_veiling: string
  descricao_comercial: string
  descricao_original: string
  preco_venda_sugerido: number
  historico_precos: any[]
  imagens: string[]
  ativo: boolean
  created_at: string
  updated_at: string
}

type TypesenseConjunto = {
  id: string
  produto_id: string
  produto_base_nome: string
  variedade: string
  nivel_comercial: string
  tipo_produto: string
  tipo_embalagem: string
  numero_pote: string
  numero_hastes: string
  numero_flores: string
  altura_cm: string
  diametro_flor_cm: string
  gramas: string
  cor: string
  codigo_veiling: string
  descricao_comercial: string
  descricao_original: string
  preco_venda_sugerido: number
  ativo: boolean
  created_at: string
  updated_at: string
}

export function mapConjuntoToTypesense(
  conjunto: ConjuntoComercial,
  produtoBase: ProdutoBase
): TypesenseConjunto {
  return {
    id: conjunto.id,
    produto_id: conjunto.produto_id,
    produto_base_nome: produtoBase.descricao, // Nome legível do produto base
    variedade: conjunto.variedade || '',
    nivel_comercial: conjunto.nivel_comercial || '',
    tipo_produto: conjunto.tipo_produto,
    tipo_embalagem: conjunto.tipo_embalagem,
    numero_pote: conjunto.numero_pote || '',
    numero_hastes: conjunto.numero_hastes || '',
    numero_flores: conjunto.numero_flores || '',
    altura_cm: conjunto.altura_cm || '',
    diametro_flor_cm: conjunto.diametro_flor_cm || '',
    gramas: conjunto.gramas || '',
    cor: conjunto.cor || '',
    codigo_veiling: conjunto.codigo_veiling,
    descricao_comercial: conjunto.descricao_comercial,
    descricao_original: conjunto.descricao_original,
    preco_venda_sugerido: conjunto.preco_venda_sugerido,
    ativo: conjunto.ativo,
    created_at: conjunto.created_at,
    updated_at: conjunto.updated_at
  }
}

export type { ConjuntoComercial, ProdutoBase, TypesenseConjunto }
