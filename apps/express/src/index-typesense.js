const fs = require('fs');
const path = require('path');
const Typesense = require('typesense');

// Typesense client configuration
const client = new Typesense.Client({
  nodes: [{ host: 'localhost', port: 8108, protocol: 'http' }],
  apiKey: 'xyz',
  numRetries: 3,
  retryIntervalSeconds: 2,
  healthcheckIntervalSeconds: 30
});

// Schema definition
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

// Function to map data to Typesense format
function mapConjuntoToTypesense(conjunto, produtoBase) {
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
  };
}

async function indexData() {
  try {
    console.log('📖 Carregando dados...');

    // Load data
    const produtosBase = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/produtos-base.json'), 'utf8'));
    const conjuntosComerciais = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/conjuntos-comerciais.json'), 'utf8'));

    console.log(`📦 Produtos Base: ${produtosBase.length}`);
    console.log(`🌸 Conjuntos Comerciais: ${conjuntosComerciais.length}`);

    // Create lookup map for produtos base
    const produtosBaseMap = new Map();
    produtosBase.forEach(produto => {
      produtosBaseMap.set(produto.id, produto);
    });

    console.log('🔧 Verificando coleção existente...');

    // Check if collection exists and delete it
    try {
      await client.collections('conjuntos_comerciais').retrieve();
      console.log('🗑️ Removendo coleção existente...');
      await client.collections('conjuntos_comerciais').delete();
    } catch (error) {
      console.log('ℹ️ Coleção não existe, criando nova...');
    }

    console.log('📋 Criando schema...');

    // Create collection
    await client.collections().create(conjuntosComerciaisSchema);

    console.log('📝 Mapeando dados para Typesense...');

    // Map data
    const typesenseDocuments = [];
    let orphanedCount = 0;

    conjuntosComerciais.forEach(conjunto => {
      const produtoBase = produtosBaseMap.get(conjunto.produto_id);
      if (!produtoBase) {
        orphanedCount++;
        console.warn(`⚠️ Produto base não encontrado para ID: ${conjunto.produto_id}`);
        return;
      }

      const typesenseDoc = mapConjuntoToTypesense(conjunto, produtoBase);
      typesenseDocuments.push(typesenseDoc);
    });

    console.log(`📊 Documentos mapeados: ${typesenseDocuments.length}`);
    if (orphanedCount > 0) {
      console.log(`⚠️ Conjuntos órfãos ignorados: ${orphanedCount}`);
    }

    console.log('⬆️ Indexando documentos...');

    // Index documents in batches
    const batchSize = 100;
    let indexed = 0;

    for (let i = 0; i < typesenseDocuments.length; i += batchSize) {
      const batch = typesenseDocuments.slice(i, i + batchSize);

      try {
        const results = await client.collections('conjuntos_comerciais').documents().import(batch);

        // Check for errors in batch
        const errors = results.filter(result => !result.success);
        if (errors.length > 0) {
          console.error(`❌ Erros no lote ${Math.floor(i / batchSize) + 1}:`, errors.slice(0, 3));
        }

        indexed += batch.length;

        if (indexed % 500 === 0 || indexed === typesenseDocuments.length) {
          console.log(`✅ Indexados: ${indexed}/${typesenseDocuments.length} (${Math.round((indexed / typesenseDocuments.length) * 100)}%)`);
        }
      } catch (error) {
        console.error(`❌ Erro no lote ${Math.floor(i / batchSize) + 1}:`, error.message);
      }
    }

    console.log('🔍 Verificando indexação...');

    // Verify indexing
    const collectionInfo = await client.collections('conjuntos_comerciais').retrieve();
    console.log(`📈 Documentos na coleção: ${collectionInfo.num_documents}`);

    // Test search
    console.log('🧪 Testando busca...');
    const searchResult = await client.collections('conjuntos_comerciais').documents().search({
      q: '*',
      per_page: 5
    });

    console.log(`🔍 Teste de busca: ${searchResult.found} documentos encontrados`);
    console.log('📋 Primeiros resultados:');
    searchResult.hits.forEach((hit, index) => {
      console.log(`  ${index + 1}. ${hit.document.descricao_comercial} (${hit.document.produto_base_nome})`);
    });

    console.log('🎉 Indexação concluída com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante indexação:', error);
    process.exit(1);
  }
}

// Run the indexing
indexData();
