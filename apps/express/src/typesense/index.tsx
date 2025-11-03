import Typesense from 'typesense'

export const client = new Typesense.Client({
  nodes: [{ host: 'localhost', port:8108, protocol: 'http' }],
  apiKey: 'xyz',
  numRetries: 3,
  retryIntervalSeconds: 2,
  healthcheckIntervalSeconds: 30
})

export const conjuntosComerciaisSchema = {
  name: 'conjuntos_comerciais',
  fields: [
    { name: 'id', type: 'string' },
    { name: 'produto_id', type: 'string', facet: true },
    { name: 'produto_base_nome', type: 'string', facet: true },
    { name: 'variedade', type: 'string', facet: true, optional: true },
    { name: 'nivel_comercial', type: 'string', facet: true, optional: true },
    { name: 'tipo_produto', type: 'string', facet: true },
    { name: 'tipo_embalagem', type: 'string', facet: true },
    { name: 'numero_pote', type: 'string', facet: true, optional: true },
    { name: 'numero_hastes', type: 'string', facet: true, optional: true },
    { name: 'numero_flores', type: 'string', facet: true, optional: true },
    { name: 'altura_cm', type: 'string', facet: true, optional: true },
    { name: 'diametro_flor_cm', type: 'string', facet: true, optional: true },
    { name: 'gramas', type: 'string', facet: true, optional: true },
    { name: 'cor', type: 'string', facet: true, optional: true },
    { name: 'codigo_veiling', type: 'string', facet: true },
    { name: 'descricao_comercial', type: 'string', sort: true },
    { name: 'descricao_original', type: 'string' },
    { name: 'preco_venda_sugerido', type: 'float', sort: true },
    { name: 'ativo', type: 'bool', facet: true },
    { name: 'created_at', type: 'string' },
    { name: 'updated_at', type: 'string' }
  ],
  default_sorting_field: 'preco_venda_sugerido'
}
