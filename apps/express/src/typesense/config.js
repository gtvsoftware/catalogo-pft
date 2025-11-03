
const Typesense = require('typesense');

// Environment-based configuration
const config = {
  development: {
    nodes: [{
      host: process.env.TYPESENSE_HOST || 'localhost',
      port: parseInt(process.env.TYPESENSE_PORT) || 8108,
      protocol: process.env.TYPESENSE_PROTOCOL || 'http'
    }],
    apiKey: process.env.TYPESENSE_API_KEY || 'xyz',
    numRetries: 3,
    retryIntervalSeconds: 2,
    healthcheckIntervalSeconds: 30
  },
  production: {
    nodes: [{
      host: process.env.TYPESENSE_HOST,
      port: parseInt(process.env.TYPESENSE_PORT) || 443,
      protocol: process.env.TYPESENSE_PROTOCOL || 'https'
    }],
    apiKey: process.env.TYPESENSE_API_KEY,
    numRetries: 3,
    retryIntervalSeconds: 2,
    healthcheckIntervalSeconds: 30
  }
};

const environment = process.env.NODE_ENV || 'development';
const typesenseConfig = config[environment];

if (!typesenseConfig.apiKey || typesenseConfig.apiKey === 'xyz') {
  console.warn('⚠️ Warning: Using default API key. Set TYPESENSE_API_KEY environment variable for production.');
}

// Create and export client
const client = new Typesense.Client(typesenseConfig);

// Collection schema
const conjuntosComerciaisSchema = {
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
};

// Search helper functions
const searchHelpers = {
  // Basic text search
  async searchProducts(query, options = {}) {
    const defaultOptions = {
      q: query,
      query_by: 'descricao_comercial,descricao_original,produto_base_nome,cor',
      per_page: 20,
      page: 1
    };

    return await client.collections('conjuntos_comerciais').documents().search({
      ...defaultOptions,
      ...options
    });
  },

  // Filter by product attributes
  async filterBy(filters, options = {}) {
    const defaultOptions = {
      q: '*',
      query_by: 'descricao_comercial',
      filter_by: filters,
      per_page: 20,
      page: 1
    };

    return await client.collections('conjuntos_comerciais').documents().search({
      ...defaultOptions,
      ...options
    });
  },

  // Get faceted results
  async getFacets(query = '*', facetFields = ['cor', 'tipo_produto', 'altura_cm']) {
    return await client.collections('conjuntos_comerciais').documents().search({
      q: query,
      query_by: 'descricao_comercial,descricao_original',
      facet_by: facetFields.join(','),
      max_facet_values: 20,
      per_page: 0 // Don't return documents, just facets
    });
  },

  // Search by codigo veiling
  async searchByCodigo(codigo) {
    return await client.collections('conjuntos_comerciais').documents().search({
      q: codigo,
      query_by: 'codigo_veiling',
      per_page: 10
    });
  },

  // Get suggestions/autocomplete
  async getSuggestions(query, limit = 10) {
    const results = await client.collections('conjuntos_comerciais').documents().search({
      q: query,
      query_by: 'descricao_comercial,produto_base_nome',
      per_page: limit,
      typo_tokens_threshold: 1
    });

    return results.hits.map(hit => hit.document.descricao_comercial);
  },

  // Upsert single document
  async upsertDocument(document) {
    return await client.collections('conjuntos_comerciais').documents().upsert(document);
  },

  // Upsert multiple documents
  async upsertDocuments(documents) {
    return await client.collections('conjuntos_comerciais').documents().import(documents, { action: 'upsert' });
  },

  // Get document by ID
  async getDocumentById(id) {
    return await client.collections('conjuntos_comerciais').documents(id).retrieve();
  },

  // Update document by ID
  async updateDocument(id, updates) {
    return await client.collections('conjuntos_comerciais').documents(id).update(updates);
  },

  // Delete document by ID
  async deleteDocument(id) {
    return await client.collections('conjuntos_comerciais').documents(id).delete();
  },

  // Batch operations
  async batchUpsert(documents, batchSize = 100) {
    console.log(`🔄 Iniciando upsert em lotes de ${batchSize} documentos...`);

    const results = [];
    let processed = 0;

    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);

      try {
        const batchResults = await client.collections('conjuntos_comerciais').documents().import(batch, { action: 'upsert' });
        results.push(...batchResults);

        processed += batch.length;

        if (processed % 500 === 0 || processed === documents.length) {
          console.log(`✅ Upsert: ${processed}/${documents.length} (${Math.round((processed / documents.length) * 100)}%)`);
        }
      } catch (error) {
        console.error(`❌ Erro no lote ${Math.floor(i / batchSize) + 1}:`, error.message);
        results.push(...batch.map(() => ({ success: false, error: error.message })));
      }
    }

    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;

    console.log(`📊 Upsert concluído: ${successCount} sucessos, ${errorCount} erros`);

    return results;
  }
};

module.exports = {
  client,
  typesenseConfig,
  conjuntosComerciaisSchema,
  searchHelpers
};
