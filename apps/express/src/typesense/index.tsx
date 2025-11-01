import Typesense from 'typesense'

export const client = new Typesense.Client({
  nodes: [{ host: 'localhost', port: '8108', protocol: 'http' }],
  apiKey: 'xyz',
  numRetries: 3,
  retryIntervalSeconds: 2,
  healthcheckIntervalSeconds: 30
})

export const conjuntosComerciaisSchema = {
  name: 'conjuntos_comerciais',
  fields: [
    { name: 'id', type: 'string' },
    { name: 'produto_base', type: 'string', facet: true },
    { name: 'variedade', type: 'string', facet: true, optional: true },
    { name: 'tipo_produto', type: 'string', facet: true },
    { name: 'tipo_embalagem', type: 'string', facet: true },
    { name: 'numero_pote', type: 'string', facet: true },
    { name: 'numero_hastes', type: 'int32', facet: true },
    { name: 'altura_cm', type: 'int32', facet: true },
    { name: 'cor', type: 'string', facet: true },
    { name: 'codigo_veiling', type: 'string', facet: true },
    { name: 'descricao_comercial', type: 'string' },
    { name: 'preco_venda_sugerido', type: 'float' },
    { name: 'ativo', type: 'bool', facet: true }
  ],
  default_sorting_field: 'preco_venda_sugerido'
}
