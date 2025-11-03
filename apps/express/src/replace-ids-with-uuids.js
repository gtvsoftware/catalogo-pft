const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Function to generate UUID v4
function generateUUID() {
  return crypto.randomUUID();
}

// Read the files
const produtosBasePath = path.join(__dirname, 'data/produtos-base.json');
const conjuntosComercaisPath = path.join(__dirname, 'data/conjuntos-comerciais.json');

console.log('📖 Lendo arquivos JSON...');

const produtosBase = JSON.parse(fs.readFileSync(produtosBasePath, 'utf-8'));
const conjuntosComerciais = JSON.parse(fs.readFileSync(conjuntosComercaisPath, 'utf-8'));

console.log(`📦 Produtos Base: ${produtosBase.length}`);
console.log(`🌸 Conjuntos Comerciais: ${conjuntosComerciais.length}`);

// Create mapping from old IDs to new UUIDs for produtos base
const idMapping = new Map();

console.log('🔄 Gerando novos UUIDs para produtos base...');

produtosBase.forEach(produto => {
  const newUUID = generateUUID();
  idMapping.set(produto.id, newUUID);
  produto.id = newUUID;
});

console.log('🔄 Atualizando IDs nos conjuntos comerciais...');

conjuntosComerciais.forEach(conjunto => {
  // Replace conjunto ID with new UUID
  conjunto.id = generateUUID();

  // Replace produto_id reference with new UUID from mapping
  if (idMapping.has(conjunto.produto_id)) {
    conjunto.produto_id = idMapping.get(conjunto.produto_id);
  } else {
    console.warn(`⚠️ Warning: produto_id ${conjunto.produto_id} not found in mapping`);
  }
});

console.log('💾 Salvando arquivos atualizados...');

// Write updated files
fs.writeFileSync(produtosBasePath, JSON.stringify(produtosBase, null, 2));
fs.writeFileSync(conjuntosComercaisPath, JSON.stringify(conjuntosComerciais, null, 2));

console.log('✅ Concluído!');
console.log('📊 Estatísticas:');
console.log(`   - ${produtosBase.length} produtos base atualizados`);
console.log(`   - ${conjuntosComerciais.length} conjuntos comerciais atualizados`);
console.log(`   - ${idMapping.size} mapeamentos de ID criados`);

console.log('\n🔍 Exemplos de novos IDs:');
console.log('Produtos Base:');
produtosBase.slice(0, 3).forEach(p => {
  console.log(`   - ${p.produto_base}: ${p.id}`);
});

console.log('Conjuntos Comerciais:');
conjuntosComerciais.slice(0, 3).forEach(c => {
  console.log(`   - ${c.descricao_comercial}: ${c.id}`);
});
