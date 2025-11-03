const { searchHelpers } = require('./typesense/config');

// Example: Single document upsert
async function upsertSingleExample() {
  try {
    console.log('📝 Exemplo de upsert de documento único...');

    // Example document
    const document = {
      id: '550e8400-e29b-41d4-a716-446655440000', // UUID
      produto_id: '11acff1e-25f1-4e6b-88e8-28d77444de3c',
      produto_base_nome: 'Rosa',
      variedade: 'Red Naomi',
      nivel_comercial: 'PREMIUM',
      tipo_produto: 'FLOR',
      tipo_embalagem: 'MACO',
      numero_pote: '',
      numero_hastes: '25',
      numero_flores: '',
      altura_cm: '70',
      diametro_flor_cm: '',
      gramas: '',
      cor: 'VERMELHO',
      codigo_veiling: '12345.070.000.00.00',
      descricao_comercial: 'Rosa Red Naomi Premium',
      descricao_original: 'ROSA RED NAOMI PREMIUM 070 CM 25 HASTES',
      preco_venda_sugerido: 85.50,
      ativo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Upsert the document
    const result = await searchHelpers.upsertDocument(document);
    console.log('✅ Upsert resultado:', result);

    // Verify it exists
    const retrieved = await searchHelpers.getDocumentById(document.id);
    console.log('🔍 Documento recuperado:', retrieved.descricao_comercial);

    // Update the document
    console.log('📝 Atualizando documento...');
    const updateResult = await searchHelpers.updateDocument(document.id, {
      preco_venda_sugerido: 95.00,
      updated_at: new Date().toISOString()
    });
    console.log('✅ Update resultado:', updateResult);

    // Search for the document
    console.log('🔍 Buscando documento...');
    const searchResult = await searchHelpers.searchProducts('Red Naomi');
    console.log(`📋 Encontrados: ${searchResult.found} resultados`);

    // Clean up - delete the example document
    console.log('🗑️ Removendo documento de exemplo...');
    await searchHelpers.deleteDocument(document.id);
    console.log('✅ Documento removido');

    console.log('🎉 Exemplo concluído!');

  } catch (error) {
    console.error('❌ Erro no exemplo:', error);
  }
}

// Example: Batch upsert
async function upsertBatchExample() {
  try {
    console.log('📝 Exemplo de upsert em lote...');

    const documents = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        produto_id: '11acff1e-25f1-4e6b-88e8-28d77444de3c',
        produto_base_nome: 'Rosa',
        descricao_comercial: 'Rosa Teste 1',
        descricao_original: 'ROSA TESTE 1',
        tipo_produto: 'FLOR',
        tipo_embalagem: 'MACO',
        cor: 'ROSA',
        codigo_veiling: 'TEST.001.000.00.00',
        preco_venda_sugerido: 50.00,
        ativo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        variedade: '',
        nivel_comercial: '',
        numero_pote: '',
        numero_hastes: '',
        numero_flores: '',
        altura_cm: '',
        diametro_flor_cm: '',
        gramas: ''
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        produto_id: '11acff1e-25f1-4e6b-88e8-28d77444de3c',
        produto_base_nome: 'Rosa',
        descricao_comercial: 'Rosa Teste 2',
        descricao_original: 'ROSA TESTE 2',
        tipo_produto: 'FLOR',
        tipo_embalagem: 'MACO',
        cor: 'BRANCO',
        codigo_veiling: 'TEST.002.000.00.00',
        preco_venda_sugerido: 60.00,
        ativo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        variedade: '',
        nivel_comercial: '',
        numero_pote: '',
        numero_hastes: '',
        numero_flores: '',
        altura_cm: '',
        diametro_flor_cm: '',
        gramas: ''
      }
    ];

    // Batch upsert
    const results = await searchHelpers.upsertDocuments(documents);
    console.log('✅ Batch upsert concluído');

    // Search for test documents
    const searchResult = await searchHelpers.searchProducts('Teste');
    console.log(`📋 Documentos de teste encontrados: ${searchResult.found}`);

    // Clean up - delete test documents
    console.log('🗑️ Removendo documentos de teste...');
    for (const doc of documents) {
      await searchHelpers.deleteDocument(doc.id);
    }
    console.log('✅ Documentos de teste removidos');

    console.log('🎉 Exemplo de lote concluído!');

  } catch (error) {
    console.error('❌ Erro no exemplo de lote:', error);
  }
}

// Run examples based on argument
const example = process.argv[2] || 'single';

if (example === 'single') {
  upsertSingleExample();
} else if (example === 'batch') {
  upsertBatchExample();
} else {
  console.error('❌ Exemplo inválido. Use: single ou batch');
  console.log('Exemplos:');
  console.log('  node upsert-examples.js single  # Exemplo de documento único');
  console.log('  node upsert-examples.js batch   # Exemplo de lote');
}
