const fs = require('fs');
const path = require('path');
const { client, searchHelpers } = require('./typesense/config');

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

async function upsertData(mode = 'all') {
  try {
    console.log(`🔄 Iniciando upsert mode: ${mode}...`);

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

    // Check if collection exists
    let collectionExists = true;
    try {
      await client.collections('conjuntos_comerciais').retrieve();
      console.log('✅ Coleção existe');
    } catch (error) {
      console.log('❌ Coleção não existe. Execute index-typesense.js primeiro.');
      process.exit(1);
    }

    let documentsToUpsert = [];

    if (mode === 'all') {
      console.log('📝 Mapeando todos os documentos...');

      conjuntosComerciais.forEach(conjunto => {
        const produtoBase = produtosBaseMap.get(conjunto.produto_id);
        if (produtoBase) {
          const typesenseDoc = mapConjuntoToTypesense(conjunto, produtoBase);
          documentsToUpsert.push(typesenseDoc);
        }
      });

    } else if (mode === 'recent') {
      console.log('📝 Mapeando documentos recentes (últimas 24h)...');

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      conjuntosComerciais.forEach(conjunto => {
        const updatedAt = new Date(conjunto.updated_at);
        if (updatedAt > yesterday) {
          const produtoBase = produtosBaseMap.get(conjunto.produto_id);
          if (produtoBase) {
            const typesenseDoc = mapConjuntoToTypesense(conjunto, produtoBase);
            documentsToUpsert.push(typesenseDoc);
          }
        }
      });

    } else if (mode === 'changed') {
      console.log('📝 Comparando com documentos existentes...');

      // Get existing documents to compare
      const existingDocs = await getAllExistingDocuments();
      const existingDocsMap = new Map(existingDocs.map(doc => [doc.id, doc]));

      conjuntosComerciais.forEach(conjunto => {
        const produtoBase = produtosBaseMap.get(conjunto.produto_id);
        if (produtoBase) {
          const typesenseDoc = mapConjuntoToTypesense(conjunto, produtoBase);
          const existing = existingDocsMap.get(typesenseDoc.id);

          // Add if document doesn't exist or has been updated
          if (!existing || existing.updated_at !== typesenseDoc.updated_at) {
            documentsToUpsert.push(typesenseDoc);
          }
        }
      });
    }

    console.log(`📊 Documentos para upsert: ${documentsToUpsert.length}`);

    if (documentsToUpsert.length === 0) {
      console.log('ℹ️ Nenhum documento para atualizar.');
      return;
    }

    // Perform batch upsert
    const results = await searchHelpers.batchUpsert(documentsToUpsert);

    // Verify results
    const collectionInfo = await client.collections('conjuntos_comerciais').retrieve();
    console.log(`📈 Total de documentos na coleção: ${collectionInfo.num_documents}`);

    console.log('🎉 Upsert concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante upsert:', error);
    process.exit(1);
  }
}

async function getAllExistingDocuments() {
  const allDocs = [];
  let page = 1;
  const perPage = 250;

  while (true) {
    const results = await client.collections('conjuntos_comerciais').documents().search({
      q: '*',
      per_page: perPage,
      page: page
    });

    allDocs.push(...results.hits.map(hit => hit.document));

    if (results.hits.length < perPage) {
      break;
    }

    page++;
  }

  return allDocs;
}

// Command line argument parsing
const mode = process.argv[2] || 'all';

if (!['all', 'recent', 'changed'].includes(mode)) {
  console.error('❌ Modo inválido. Use: all, recent, ou changed');
  console.log('Exemplos:');
  console.log('  node upsert-typesense.js all     # Atualiza todos os documentos');
  console.log('  node upsert-typesense.js recent  # Atualiza documentos das últimas 24h');
  console.log('  node upsert-typesense.js changed # Atualiza apenas documentos modificados');
  process.exit(1);
}

// Run the upsert
upsertData(mode);
