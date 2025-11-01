import { ConjuntoComercial, ProdutoBase } from '@terraviva/database-pft'

type TypesenseConjunto = {
  id: string
  produto_base: string
  variedade: string
  tipo_produto: string
  tipo_embalagem: string
  numero_pote: string
  numero_hastes: number
  altura_cm: number
  cor: string
  codigo_veiling: string
  descricao_comercial: string
  preco_venda_sugerido: number
  ativo: boolean
}

export function mapConjuntoToTypesense(
  conjunto: ConjuntoComercial & { produtoBase: ProdutoBase }
): TypesenseConjunto {
  return {
    id: conjunto.id,
    produto_base: conjunto.produtoBase.produtoBase, // Nome do produto base
    variedade: conjunto.variedade ?? '',
    tipo_produto: conjunto.tipoProduto,
    tipo_embalagem: conjunto.tipoEmbalagem,
    numero_pote: conjunto.numeroPote ?? '',
    numero_hastes: conjunto.numeroHashtes ? Number(conjunto.numeroHashtes) : 0,
    altura_cm: conjunto.alturaCm ? Number(conjunto.alturaCm) : 0,
    cor: conjunto.cor || '',
    codigo_veiling: conjunto.codigoVeiling ?? '',
    descricao_comercial: conjunto.descricaoComercial,
    preco_venda_sugerido: Number(conjunto.precoVendaSugerido ?? 0),
    ativo: conjunto.ativo ?? true
  }
}
