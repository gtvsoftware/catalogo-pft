# Typesense Implementation for Catálogo PFT

This implementation provides full-text search capabilities for the flower catalog using Typesense.

## Files Structure

```
src/
├── typesense/
│   ├── index.tsx          # Main Typesense client and schema (TypeScript)
│   ├── typesense.ts       # Type definitions and mapping functions
│   └── config.js          # Configuration and search helpers
├── index-typesense.js     # Indexing script
├── test-typesense.js      # Search testing script
└── data/
    ├── produtos-base.json
    └── conjuntos-comerciais.json
```

## Setup

### 1. Install Typesense Server

```bash
# Using Docker (recommended)
docker run -d --name typesense \
  -p 8108:8108 \
  -v/tmp/typesense-data:/data \
  typesense/typesense:0.25.2 \
  --data-dir /data \
  --api-key=xyz \
  --enable-cors
```

### 2. Environment Variables (Optional)

Create a `.env` file or set environment variables:

```bash
TYPESENSE_HOST=localhost
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL=http
TYPESENSE_API_KEY=xyz
NODE_ENV=development
```

## Usage

### Index Data

```bash
# From apps/express directory
npm run index-typesense
```

This will:
- Delete existing collection (if any)
- Create new schema
- Map and index all 6,123+ products
- Verify indexing success

### Test Search

```bash
npm run test-typesense
```

Runs comprehensive tests including:
- Basic text search
- Color filtering
- Product type filtering
- Complex filters
- Faceted search
- Code search
- Typo tolerance

## Search Features

### 1. Full-Text Search

```javascript
const { searchHelpers } = require('./src/typesense/config');

// Search products
const results = await searchHelpers.searchProducts('rosa lirio');
```

### 2. Filtering

```javascript
// Filter by color
const rosaProducts = await searchHelpers.filterBy('cor:ROSA');

// Complex filters
const filteredResults = await searchHelpers.filterBy('cor:BRANCO && tipo_produto:FLOR');
```

### 3. Faceted Search

```javascript
// Get facets for a search
const facets = await searchHelpers.getFacets('lirio', ['cor', 'altura_cm', 'tipo_embalagem']);
```

### 4. Autocomplete/Suggestions

```javascript
// Get suggestions
const suggestions = await searchHelpers.getSuggestions('ros', 5);
```

### 5. Code Search

```javascript
// Search by Veiling code
const results = await searchHelpers.searchByCodigo('00077');
```

## Schema Details

The Typesense collection includes all fields from the JSON data:

**Searchable Fields:**
- `descricao_comercial` - Main product name
- `descricao_original` - Original description from CSV
- `produto_base_nome` - Base product name (e.g., "Rosa", "Lírio")
- `cor` - Color

**Facetable Fields:**
- `cor` - Color facets
- `tipo_produto` - FLOR/PLANTA
- `tipo_embalagem` - MACO/POTE/BANDEJA
- `altura_cm` - Height in cm
- `numero_hastes` - Number of stems
- `variedade` - Product variety
- And more...

## Performance

- **Index Size:** ~6,123 documents
- **Search Speed:** Sub-50ms typical response time
- **Features:** Typo tolerance, faceting, filtering, sorting
- **Memory Usage:** ~10-20MB for full dataset

## API Integration

### Express.js Route Example

```javascript
const { searchHelpers } = require('./typesense/config');

app.get('/api/search', async (req, res) => {
  try {
    const { q, cor, tipo_produto, page = 1 } = req.query;

    let filters = [];
    if (cor) filters.push(`cor:${cor}`);
    if (tipo_produto) filters.push(`tipo_produto:${tipo_produto}`);

    const results = await searchHelpers.searchProducts(q, {
      filter_by: filters.join(' && '),
      page: parseInt(page),
      per_page: 20
    });

    res.json({
      products: results.hits.map(hit => hit.document),
      total: results.found,
      page: parseInt(page),
      facets: results.facet_counts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Monitoring

### Health Check

```javascript
const { client } = require('./src/typesense/config');

// Check cluster health
const health = await client.health.retrieve();
console.log('Typesense health:', health);

// Get collection stats
const stats = await client.collections('conjuntos_comerciais').retrieve();
console.log('Documents:', stats.num_documents);
```

## Troubleshooting

### Common Issues

1. **Connection Refused**: Ensure Typesense server is running on port 8108
2. **API Key Error**: Check TYPESENSE_API_KEY matches server configuration
3. **Indexing Fails**: Verify JSON files exist in `data/` directory
4. **Search Returns Empty**: Check collection exists and has documents

### Debug Mode

Set environment variable for detailed logging:
```bash
DEBUG=typesense* node src/index-typesense.js
```

## Production Deployment

For production:
1. Use Typesense Cloud or dedicated server
2. Set proper API keys and HTTPS
3. Enable authentication
4. Configure backups
5. Monitor performance metrics

## Updates

To update data:
1. Re-run parser: `node parse-all-products.js`
2. Re-index: `npm run index-typesense`
3. Test: `npm run test-typesense`

The indexing script handles full replacement automatically.
