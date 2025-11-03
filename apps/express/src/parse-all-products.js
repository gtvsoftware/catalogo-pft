const fs = require('fs');
const path = require('path');

// Carrega CSV de entrada para `lines` (cada linha: codigo;descricao)
const csvPath = path.join(__dirname, 'data', 'produtos.csv');
let lines = [];
try {
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  // preserva linhas não vazias
  lines = csvContent.split(/\r?\n/).filter(l => l && l.trim());
} catch (err) {
  console.error(`Erro ao ler ${csvPath}:`, err.message);
  process.exit(1);
}

// Função para gerar slug
function generateSlug(text, usedSlugs = new Set()) {
  if (!text) return 'produto-sem-nome';

  // Remove acentos e caracteres especiais
  const normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais, mantém letras, números, espaços e hífens
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens múltiplos
    .replace(/^-|-$/g, ''); // Remove hífens do início e fim

  // Limita tamanho e garante que não está vazio
  let slug = normalized.substring(0, 50).replace(/-$/, '');
  if (!slug) slug = 'produto';

  // Garante unicidade
  let uniqueSlug = slug;
  let counter = 1;
  while (usedSlugs.has(uniqueSlug)) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }
  usedSlugs.add(uniqueSlug);

  return uniqueSlug;
}

// Função para capitalizar corretamente
function capitalize(text) {
  if (!text) return text;

  // Palavras que devem ficar em maiúsculas
  const upperWords = ['GERB', 'GERBERA', 'CRIS', 'GYPS', 'GYPSO', 'ALSTRO', 'BOUV',
    'PHAL', 'DEND', 'CYMB', 'CM', 'HA', 'HT', 'FL', 'FLS', 'MIN', 'DIAM', 'VARIEGATO'];

  // Palavras que devem ficar em lowercase
  const lowerWords = ['de', 'da', 'do', 'dos', 'das', 'e', 'a', 'o'];

  return text.split(' ')
    .map((word, index) => {
      const cleanWord = word.trim();
      if (!cleanWord) return '';

      // Mantém números e símbolos como estão
      if (/^[0-9<>\/\-]+$/.test(cleanWord)) return cleanWord;

      // Palavras que ficam em maiúsculas
      if (upperWords.includes(cleanWord.toUpperCase())) {
        return cleanWord.toUpperCase();
      }

      // Palavras que ficam em minúsculas (exceto primeira palavra)
      if (index > 0 && lowerWords.includes(cleanWord.toLowerCase())) {
        return cleanWord.toLowerCase();
      }

      // Capitaliza primeira letra, resto minúsculo
      return cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1).toLowerCase();
    })
    .join(' ')
    .trim();
}


// Função para extrair informações da descrição
function parseDescricao(codigo, descricao) {
  let desc = descricao.trim();
  // working copy used for removals
  let descLimpa = desc;
  let tipoEmbalagem = null;
  let numeroPote = null;
  // Normaliza correções conhecidas de typos vindas do CSV/veiling
  // Ex.: "SHENA" deve ser "SHENNA", "SUNY" deve ser "SUNNY"
  desc = desc.replace(/\bSHENA\b/gi, 'SHENNA');
  desc = desc.replace(/\bSUNY\b/gi, 'SUNNY');
  // Expande abreviações comuns: ASP -> Aspargo
  desc = desc.replace(/\bASP\b/gi, 'ASPARGO');
  // Normaliza Avencao -> Avencão
  desc = desc.replace(/\bAVENCAO\b/gi, 'AVENCÃO');
  // Normaliza variantes de São Jorge: Sao Jorge, S. Jorge, S Jorge
  desc = desc.replace(/\bSAO\s+JORGE\b/gi, 'SÃO JORGE');
  desc = desc.replace(/\bS\.?\s*JORGE\b/gi, 'SÃO JORGE');
  // Normaliza Anthurio -> Antúrio
  desc = desc.replace(/\bANTHURIO\b/gi, 'ANTÚRIO');
  // Normaliza Regan -> Reagan
  desc = desc.replace(/\bREGAN\b/gi, 'REAGAN');
  // Normaliza Regan -> Reagan
  desc = desc.replace(/\bREGAN\b/gi, 'REAGAN');
  // Normaliza abreviações de 'carnosa': CARN., CAR., CAR -> CARNOSA
  // Faz CARN primeiro para não ser sobrescrito por CAR
  // Adiciona espaço depois para evitar concatenação com a palavra seguinte (ex: 'CARNOSA VARIEGATO')
  desc = desc.replace(/\bCARN\.?\b/gi, 'CARNOSA ');
  desc = desc.replace(/\bCAR\.?\b/gi, 'CARNOSA ');

  // Remove pontos soltos no texto original (ex: 'CARNOSA . VARIEGATO') para manter descricao_original limpa
  desc = desc.replace(/\s*\.\s*/g, ' ').replace(/\s+/g, ' ').trim();

  // Normaliza quantidades com '+' que indicam "mínimo" (ex: '11+' -> 'MIN 11')
  // Também converte '11+ FLS' -> 'MIN 11 FLS' para evitar duplicação com 'MIN 11 FLS' já presente
  desc = desc.replace(/\b(\d+)\+\s*(FLS?|F)?\b/gi, function(_, n, f) {
    if (f) return `MIN ${n} ${f}`;
    return `MIN ${n}`;
  });

  // working copy used for removals
  descLimpa = desc;
  const palavras = desc.split(' ').filter(p => p);
  let produtoBase = palavras[0]?.toLowerCase() || '';

  // Corrigir abreviações
  if (produtoBase === 'cris') produtoBase = 'crisantemo';

  // Determina tipo de produto
  const plantasKeywords = ['ficus', 'calathea', 'monstera', 'zamioculcas', 'anthurium', 'bromelia',
    'peperomia', 'maranta', 'cactus', 'suculenta', 'beaucarnea', 'palmeira', 'tuia', 'lavandula',
    'spathiphyllum', 'curcuma', 'hibiscus', 'mandevilla', 'dipladenia', 'pilea', 'coleus',
    'echeveria', 'gasteraloe', 'albuca', 'hyacinthus', 'narcissus', 'tulipa'];

  const florKeywords = ['rosa', 'lirio', 'crisantemo', 'cris', 'santini', 'gypsophila', 'gypso',
    'lisianthus', 'alstroemeria', 'bouvardia', 'craspedia', 'celosia', 'kalanchoe', 'aster',
    'amaryllis', 'phalaenopsis', 'phal', 'dendrobium', 'orquidea', 'cymbidium', 'oncidium',
    'vanda', 'zantedeschia', 'calla', 'girassol', 'buque', 'maco', 'goivo', 'veronica',
    'dianthus', 'trachelium', 'eryngium', 'statice', 'limonium', 'perpetua', 'folhagem',
    'tagete', 'salvia', 'loropetalum', 'caryopteris', 'boca de leao'];

  let tipoProduto = 'PLANTA';
  const descLower = desc.toLowerCase();

  for (const keyword of florKeywords) {
    if (descLower.includes(keyword)) {
      tipoProduto = 'FLOR';
      break;
    }
  }

  // Extrai variedade
  let variedade = null;
  const variedadePatterns = [
    /(?:LYRATA|ELASTICA|ADANSONII|ORBIFOLIA|MEDALLION|ORNATA|ZEBRINA|BURGUNDY|RUBY|TINEKE|SHIVEREANA)/i,
    /(?:NOBILY|ALOHA|BARROCCO|HONEY ANGEL)/i,
    /(?:PAGODA|STOECHAS|ANGUSTIFOLIA|SUPERBLUE)/i,
    /(?:MINI|MIDI|CASCATA|MULTIFLORA|FROZEN)/i,
    /(?:BAMBINO|BLACK QUEEN|ZENZI|CHAMELEON)/i,
    /(?:PICOLI|ROSE QUEEN|GOLDEN|LEMON)/i,
    /(?:ELEGANCE|ATLANTIC|SINGER|EXPLORE)/i
  ];

  for (const pattern of variedadePatterns) {
    const match = desc.match(pattern);
    if (match) {
      variedade = match[0];
      break;
    }
  }

  const containerMatch = desc.match(/C(\d+)/i);
  if (containerMatch) {
    numeroPote = containerMatch[1];
    // 'C##' codes represent a "cuia" packaging (diameter), not a regular pote
    tipoEmbalagem = 'CUIA';
    // Remove C## da descrição
    descLimpa = descLimpa.replace(/\s*C\d+\s*/gi, ' ').replace(/\s+/g, ' ').trim();
    if (codigo === '00071.080.000.00.00') {
      console.log(`DEBUG 00071 APOS C: descLimpa = "${descLimpa}"`);
    }
  }

  const poteMatch = desc.match(/P(\d+)/i);
  if (poteMatch && !numeroPote) {
    numeroPote = poteMatch[1];
    tipoEmbalagem = 'POTE';
    // Remove P## da descrição
    descLimpa = descLimpa.replace(/\s*P\d+\s*/gi, ' ').replace(/\s+/g, ' ').trim();
  }

  if (desc.match(/MACO|BUQUE/i)) {
    tipoEmbalagem = 'MACO';
    numeroPote = null;
  }

  if (desc.match(/BANDEJA/i)) {
    tipoEmbalagem = 'BANDEJA';
  }

  if (desc.match(/TERRARIO/i)) {
    tipoEmbalagem = 'TERRARIO';
  }

  // Extração especial: Lirio Oriental + número = altura_cm
  let alturaCm = null;
  let alturaOrientalMatch = descLimpa.match(/L[íi]rio\s+Orient(?:al|\.|\s|$)\s*(\d{2,3})\b/i);
  if (alturaOrientalMatch) {
    alturaCm = alturaOrientalMatch[1];
    // Remove the number but keep "Lírio Oriental"
    descLimpa = descLimpa.replace(/L[íi]rio\s+Orient(?:al|\.|\s)\s*\d{2,3}\b/i, 'Lírio Oriental').replace(/\s+/g, ' ').trim();
  }

  // TRATATIVA ESPECIAL PARA GERBERAS
  // Em Gerbera: "<10 HA" ou ">10 HA" significa hastes
  // Em Gerbera: "<10" ou ">10" SEM HA significa diâmetro da flor
  let diametroFlorCm = null;
  let numeroHashtes = null;
  let numeroFlores = null;

  const isGerbera = desc.match(/GERB/i);

  if (isGerbera) {
    // Para GERBERA: processa na ordem certa
    // Padrão complexo: "GERB STANZA <10 050 CM DIAM < 10"
    // <10 (antes de CM) = hastes
    // 050 CM = altura
    // DIAM < 10 = diâmetro

    // 1. Extrai hastes que aparecem ANTES de número+CM: "<10 050 CM" ou ">10 070 CM"
    const gerbHastesSemHaMatch = descLimpa.match(/(<|>)\s*(\d+)\s+(?=\d+\s*CM)/i);
    if (gerbHastesSemHaMatch) {
      numeroHashtes = `${gerbHastesSemHaMatch[1]} ${gerbHastesSemHaMatch[2]}`;
      descLimpa = descLimpa.replace(/\s*(<|>)\s*\d+\s+(?=\d+\s*CM)/gi, ' ').replace(/\s+/g, ' ').trim();
    } else {
      // Ou padrão com HA explícito: "<10 HA", ">10 HA"
      const gerbHastesMatch = descLimpa.match(/(<|>)\s*(\d+)\s+HA\b/i);
      if (gerbHastesMatch) {
        numeroHashtes = `${gerbHastesMatch[1]} ${gerbHastesMatch[2]}`;
        descLimpa = descLimpa.replace(/\s*(<|>)\s*\d+\s+HA\b\s*/gi, ' ').replace(/\s+/g, ' ').trim();
      }
    }

    // 2. Extrai diâmetro que sobrou sem HA e sem estar antes de CM: "<10" ou ">10"
    // Só pega se NÃO estiver seguido de CM (já que altura vem depois)
    const gerbDiamMatch = descLimpa.match(/(<|>)\s*(\d+)\b(?!\s*(?:CM|HA))/i);
    if (gerbDiamMatch) {
      diametroFlorCm = `${gerbDiamMatch[1]} ${gerbDiamMatch[2]}`;
      descLimpa = descLimpa.replace(/\s*(<|>)\s*\d+\b(?!\s*(?:CM|HA))\s*/gi, ' ').replace(/\s+/g, ' ').trim();
    }
  }

  // ORDEM DE EXTRAÇÃO (importa!):
  // 1. Diâmetro (DIAM explícito)
  // 2. Hastes (<10 HA / >10 HA com HA explícito)
  // 3. Altura (< 50 CM / > 80 CM)

  // 1. Extrai diâmetro da flor (se não foi extraído pela tratativa Gerbera)
  if (!diametroFlorCm) {
    // Padrão: "DIAM < 10", "DIAM MIN 10", "DIAM 10/12"
    const diamMatch = desc.match(/DIAM\s*(<|>|MIN)?\s*(\d+(?:\/\d+)?)\s*(?:CM)?/i);
    if (diamMatch) {
      const operador = diamMatch[1] ? diamMatch[1].toUpperCase() : '';
      const valor = diamMatch[2];
      if (operador === '<') {
        diametroFlorCm = `< ${valor}`;
      } else if (operador === '>') {
        diametroFlorCm = `> ${valor}`;
      } else if (operador === 'MIN') {
        diametroFlorCm = `MIN ${valor}`;
      } else {
        diametroFlorCm = valor;
      }
      // Remove DIAM da descrição
      descLimpa = descLimpa.replace(/\s*DIAM\s*(<|>|MIN)?\s*\d+(?:\/\d+)?\s*(?:CM)?\s*/gi, ' ').replace(/\s+/g, ' ').trim();
    } else if (isGerbera) {
      // Fallback: verifica código Veiling para Gerberas (quando descrição truncada)
      // .71. = diâmetro < 10 cm
      // .10. = diâmetro MIN 10 cm
      if (codigo.includes('.71.')) {
        diametroFlorCm = '< 10';
      } else if (codigo.includes('.10.')) {
        diametroFlorCm = 'MIN 10';
      }
      // Remove DIAM truncado da descrição: "DIAM <", "DIAM >"
      descLimpa = descLimpa.replace(/\s*DIAM\s*(<|>|MIN)?\s*/gi, ' ').replace(/\s+/g, ' ').trim();
    }
  }

  // 2. Extrai número de hastes (se não foi extraído pela tratativa Gerbera)
  if (!numeroHashtes) {
    // Primeiro tenta capturar padrões com <, > SEGUIDO de HA: "<10 HA", ">10 HA"
    const hastesComparadorMatch = descLimpa.match(/(<|>)\s*(\d+)\s+(?:HA|HASTES?)\b/i);
    if (hastesComparadorMatch) {
      const operador = hastesComparadorMatch[1];
      const valor = hastesComparadorMatch[2];
      numeroHashtes = `${operador} ${valor}`;
      descLimpa = descLimpa.replace(/\s*(<|>)\s*\d+\s+(?:HA|HASTES?)\b\s*/gi, ' ').replace(/\s+/g, ' ').trim();
    } else {
      // Captura formatos com HA/HT + número (com ou sem F/FL/FLS)
      // "HA 2/3 F" = 1 haste, 2/3 flores
      // "HA 3/5" = 1 haste, 3/5 flores (sem F/FL/FLS também é flores!)
      // "2 HA 4/5 FLS" = 2 hastes, 4/5 flores
      // "HA MIN 2 F" = 1 haste, MIN 2 flores
      // IMPORTANTE: só captura se HA/HT estiver isolado (não parte de palavra como "BRIGHT")
      const hastesFloresMatch = descLimpa.match(/(?:(\d+)\s+)?\b(?:HA|HT|HAST)\s+((?:MIN\s+)?(?:\d+\/\d+|\d+))(?:\s*(?:FLS?|F))?\b/i);

      if (hastesFloresMatch) {
        // hastesFloresMatch[1] = número de hastes (ou undefined se não tiver)
        // hastesFloresMatch[2] = número de flores
        numeroHashtes = hastesFloresMatch[1] || "1";
        numeroFlores = hastesFloresMatch[2];

        // Remove o padrão completo da descrição
        descLimpa = descLimpa.replace(/\s*(?:\d+\s+)?(?:HA|HT)\s+(?:MIN\s+)?(?:\d+\/\d+|\d+)(?:\s*(?:FLS?|F))?\b\s*/gi, ' ').replace(/\s+/g, ' ').trim();
      } else {
        // Se não tem o padrão HA+número, tenta extrair só flores primeiro, depois hastes

        // Tenta extrair apenas flores: "4/5 FLS", "MIN 1 FL"
        // Nota: exige marcador F/FLS para o caso MIN para evitar confusão com "MIN <n> G" (gramas)
        const floresMatch = descLimpa.match(/(?:MIN\s+(\d+)\s*(?:FLS?|F))|(?:(\d+\/\d+|\d+)\s*(?:FLS?|F))\b/i);
        if (floresMatch) {
          if (floresMatch[1]) {
            numeroFlores = `MIN ${floresMatch[1]}`;
          } else if (floresMatch[2]) {
            numeroFlores = floresMatch[2];
          }
          descLimpa = descLimpa.replace(/\s*(?:MIN\s+\d+\s*(?:FLS?|F))|(?:(?:\d+\/\d+|\d+)\s*(?:FLS?|F))\b\s*/gi, ' ').replace(/\s+/g, ' ').trim();
        }

        // Tenta extrair apenas hastes: "28 HASTES", "5/6 HT", "2 HAST"
        const hastesMatch = descLimpa.match(/(\d+\/\d+|\d+)\s+\b(HT|HA|H|HAST|HASTES?)\b/i);
        if (hastesMatch) {
          numeroHashtes = `MIN ${hastesMatch[1]}`;
          descLimpa = descLimpa.replace(/\s*\d+(?:\/\d+)?\s+(?:HT|HA|H|HAST|HASTES?)\b\s*/gi, ' ').replace(/\s+/g, ' ').trim();
        }

        // Tenta extrair MIN case: "HA MIN 2", "MIN 2 HA"
        const hastesMinMatch = descLimpa.match(/(?:\b(?:HT|HA|HAST)\s+MIN\s+(\d+)|MIN\s+(\d+)\s+\b(?:HT|HA))\b(?:\s*(?:FLS?|F))?\b/i);
        if (hastesMinMatch) {
          // Dois casos possíveis:
          // 1) "HA MIN 2"  -> corresponde ao primeiro grupo (hastesMinMatch[1])
          //    historicamente isso era interpretado como 1 haste e MIN X flores
          // 2) "MIN 2 HA"  -> corresponde ao segundo grupo (hastesMinMatch[2])
          //    neste caso queremos interpretar como MIN 2 HASTES
          if (hastesMinMatch[1]) {
            // "HA MIN 2" -> manter comportamento anterior
            numeroHashtes = '1';
            numeroFlores = 'MIN ' + hastesMinMatch[1];
          } else if (hastesMinMatch[2]) {
            // "MIN 2 HA" -> significa MIN 2 hastes
            numeroHashtes = 'MIN ' + hastesMinMatch[2];
          }
          descLimpa = descLimpa.replace(hastesMinMatch[0], '').replace(/\s+/g, ' ').trim();
        }
      }
    }
  }

  // Remove HA, HT, H, F, FLS, HASTES isolados que sobraram, incluindo números soltos após remoção
  // Detect glued hastes like "2HT" or "MIN2HT" and set numeroHashtes when appropriate

  // Special for Phalaenopsis: if no numero_pote and has \d+\/\d+ or MIN \d+, set as pot
  if ((produtoBase === 'pha' || produtoBase === 'phal' || produtoBase === 'phalaenopsis') && !numeroPote) {
    const potMatch = descLimpa.match(/(\d+\/\d+|\bMIN\s+\d+)/);
    if (potMatch) {
      numeroPote = potMatch[1];
      descLimpa = descLimpa.replace(potMatch[0], '').replace(/\s+/g, ' ').trim();
    }
  }

  const gluedHastesMatch = descLimpa.match(/(?:MIN\s*)?(\d+(?:\/\d+)?)(?:\s*)?(?:HT|HA|H|HAST|HASTES?)\b/i);
  if (gluedHastesMatch && !numeroHashtes) {
    const raw = gluedHastesMatch[0];
    numeroHashtes = `MIN ${gluedHastesMatch[1]}`;
    descLimpa = descLimpa.replace(raw, '').replace(/\s+/g, ' ').trim();
  }

  // Remove numbers glued to markers like "2HT" or "4/5FLS" that weren't caught by spaced regexes
  descLimpa = descLimpa.replace(/(\d+(?:\/\d+)?)(?:\s*)?(?:HT|HA|H|FLS?|HASTES?)\b/gi, ' ').trim();

  descLimpa = descLimpa
    .replace(/\s+(?:HA|HT|H|FLS?|HASTES?)\s+/gi, ' ')
    .replace(/\s+(?:HA|HT|H|FLS?|HASTES?)$/gi, '')
    .replace(/^(?:HA|HT|H|FLS?|HASTES?)\s+/gi, '')
    .replace(/\s+P\s*$/i, '') // Remove "P" isolado no final (resíduo de "MIN 2 HA P")
    .replace(/\s+\d+\s+P\s*$/i, ' ') // Remove "número P" no final
    .replace(/\s+\d\s*$/i, '') // Remove apenas 1 dígito solto no final (não 2-3 que podem ser altura!)
    .replace(/\s+/g, ' ')
    .trim();

  // 3. Extrai gramas (ANTES de extrair altura para evitar conflitos!)
  let gramas = null;
  // Primeiro tenta padrão explícito com G/GR/GRA/GRAM/GRAMAS
  const gramasExplicitaMatch = descLimpa.match(/(MIN\s+)?(\d+)\s+(?:GRAMAS?|GRAMS?|GRA|GR|G)\b/i);
  if (gramasExplicitaMatch) {
    const hasMin = gramasExplicitaMatch[1];
    const valor = gramasExplicitaMatch[2];
    gramas = hasMin ? `MIN ${valor}` : valor;
    descLimpa = descLimpa.replace(/\s*(?:MIN\s+)?\d+\s+(?:GRAMAS?|GRAMS?|GRA|GR|G)\b\s*/gi, ' ').replace(/\s+/g, ' ').trim();
  } else {
    // Se não encontrou, tenta "MIN número" isolado no final (comum em Lisianthus vendido por peso)
    // Só captura se o número for >= 5 (para evitar pegar flores como "MIN 2", "MIN 3")
    const gramasImplicitaMatch = descLimpa.match(/MIN\s+(\d+)\s*$/i);
    if (gramasImplicitaMatch && parseInt(gramasImplicitaMatch[1]) >= 5) {
      gramas = `MIN ${gramasImplicitaMatch[1]}`;
      descLimpa = descLimpa.replace(/\s*MIN\s+\d+\s*$/i, ' ').replace(/\s+/g, ' ').trim();
    }
  }

  // 4. Extrai altura (DEPOIS de remover hastes e gramas!)
  if (!alturaCm) {
    // Captura altura com MAX/MIN: "MAX 40 CM" ou "MIN 40 CM"
    const alturaMaxCmMatch = descLimpa.match(/MAX\s+(\d{2,3})\s*(?:CM|C)\b/i);
    if (alturaMaxCmMatch) {
      alturaCm = `MAX ${alturaMaxCmMatch[1]}`;
      descLimpa = descLimpa.replace(/MAX\s+\d{2,3}\s*(?:CM|C)\b/i, ' ').replace(/\s+/g, ' ').trim();
    }
    // Captura altura com MIN: "MIN 40 CM" -> altura mínima
    const alturaMinCmMatch = descLimpa.match(/MIN\s+(\d{2,3})\s*(?:CM|C)\b/i);
    if (alturaMinCmMatch) {
      alturaCm = `MIN ${alturaMinCmMatch[1]}`;
      descLimpa = descLimpa.replace(/MIN\s+\d{2,3}\s*(?:CM|C)\b/i, ' ').replace(/\s+/g, ' ').trim();
    }
    const alturaComparadorMatch = descLimpa.match(/(<|>)\s*(\d+)\s*(?:CM|C)\b/i);
    if (alturaComparadorMatch) {
      const operador = alturaComparadorMatch[1];
      const valor = alturaComparadorMatch[2];
      alturaCm = `${operador} ${valor}`;
      descLimpa = descLimpa.replace(/\s*(<|>)\s*\d+\s*(?:CM|C)\b\s*/gi, ' ').replace(/\s+/g, ' ').trim();
    } else {
      // Captura altura com padrão "080-23 CM" - pega apenas o número antes do traço
      const alturaComTracoMatch = descLimpa.match(/(\d{2,3})-\d+\s*(?:CM|C)\b/i);
      if (alturaComTracoMatch) {
        alturaCm = alturaComTracoMatch[1];
        descLimpa = descLimpa.replace(/\s*\d{2,3}-\d+\s*(?:CM|C)\b\s*/gi, ' ').replace(/\s+/g, ' ').trim();
      } else {
        // Captura altura normal: "070 CM", "50 CM" ou "070 C", "50 C"
        const alturaMatch = descLimpa.match(/(\d+)\s*(?:CM|C)\b/i);
        if (alturaMatch) {
          alturaCm = alturaMatch[1];
          descLimpa = descLimpa.replace(/\s*\d+\s*(?:CM|C)\b\s*/gi, ' ').replace(/\s+/g, ' ').trim();
        } else {
          // Captura altura com padrão "070-01" sem CM - pega apenas o número antes do traço
          const alturaComTracoSemCmMatch = descLimpa.match(/\s+(\d{2,3})-\d+\s*$/i);
          if (alturaComTracoSemCmMatch) {
            alturaCm = alturaComTracoSemCmMatch[1];
            descLimpa = descLimpa.replace(/\s+\d{2,3}-\d+\s*$/i, ' ').replace(/\s+/g, ' ').trim();
          } else {
            // Captura altura seguida de cor: "MAGIC 70 ROSA" ou "ORANGE REGAN 080"
            // Primeiro tenta padrão onde cor vem ANTES do número
            // Aceita qualquer coisa entre cor e número: ORANGE + qualquer palavra + número
            const alturaAposCorMatch = descLimpa.match(/(?:BRANCO|ROSA|ROSE|PINK|VERMELHO|RED|ROXO|PURPLE|VIOLET|AMARELO|YELLOW|LARANJA|ORANGE|AZUL|BLUE|VERDE|GREEN|SALMAO|SALMON|CHAMPAGNE|BICOLOR|VINHO|PRETO|BLACK)\s+\w+\s+(\d{2,3})\s*$/i);
            if (alturaAposCorMatch) {
              alturaCm = alturaAposCorMatch[1];
              descLimpa = descLimpa.replace(/(\d{2,3})\s*$/i, '').replace(/\s+/g, ' ').trim();
            } else {
              // Captura altura sem CM/C no final: "CELOSIA VINHO 080" ou "DIANTHUS KIWI MELLOW 70"
              // Aceita 2 ou 3 dígitos no final, com ou sem espaço antes
              const alturaSemCmMatch = descLimpa.match(/(\d{2,3})\s*$/i);
              if (alturaSemCmMatch) {
                alturaCm = alturaSemCmMatch[1];
                descLimpa = descLimpa.replace(/\d{2,3}\s*$/i, '').replace(/\s+/g, ' ').trim();
              } else {
                // Captura altura onde número vem ANTES da cor: "MAGIC 70 ROSA"
                const alturaAntesDaCorMatch = descLimpa.match(/\s+(\d{2,3})\s+(?:BRANCO|ROSA|ROSE|PINK|VERMELHO|RED|ROXO|PURPLE|VIOLET|AMARELO|YELLOW|LARANJA|ORANGE|AZUL|BLUE|VERDE|GREEN|SALMAO|SALMON|CHAMPAGNE|BICOLOR|VINHO|PRETO|BLACK)\b/i);
                if (alturaAntesDaCorMatch) {
                  alturaCm = alturaAntesDaCorMatch[1];
                  descLimpa = descLimpa.replace(/\s+\d{2,3}(?=\s+(?:BRANCO|ROSA|ROSE|PINK|VERMELHO|RED|ROXO|PURPLE|VIOLET|AMARELO|YELLOW|LARANJA|ORANGE|AZUL|BLUE|VERDE|GREEN|SALMAO|SALMON|CHAMPAGNE|BICOLOR|VINHO|PRETO|BLACK)\b)/i, '').replace(/\s+/g, ' ').trim();
                }
              }
            }
          }
        }
      }
    }
  }

  // Extrai cor
  let cor = null;
  const corPatterns = {
    'BRANCO': /BRANCO|BCO|WHITE|SNOW/i,
    'ROSA': /ROSA|ROSE|PINK|\bROS\b/i,
    'VERMELHO': /VERMELHO|RED|VERM/i,
    'LILAS': /LILAS|LILAC/i,
    'ROXO': /ROXO|PURPLE|VIOLET/i,
    'AMARELO': /AMARELO|YELLOW/i,
    'LARANJA': /LARANJA|ORANGE|DARK\s+ORANGE|D\.?\s*ORAN|\bLA\b/i,
    'AZUL': /AZUL|BLUE/i,
    'VERDE': /VERDE|GREEN/i,
    'SALMAO': /SALMAO|SALMON/i,
    // Aceita CHAMP, CHAMPAGNE e variações; mapeia para português 'CHAMPANHE'
    'CHAMPANHE': /CHAMPAGNE|CHAMP\b/i,
    // Aceita CRE/CREME/CREAM (algumas descrições usam 'CRE' truncado)
    'CREME': /CREME|CREAM|\bCRE\b/i,
    'BICOLOR': /BICOLOR/i,
    'VINHO': /VINHO/i,
    'BRONZE': /BRONZE/i,
    'PRETO': /PRETO|BLACK/i,
    // 'CHA' deve ser palavra isolada (para evitar casar com 'CHAMP')
    'CHA': /\b(?:CHA|CHAI|TEA)\b/i,
    'VARIADA': /VARIADA|VARIADO|MIXED|MIX/i
  };

  // Detecta múltiplas cores (ex: "BRANCO/ROSA", "ROSA E VERDE")
  const coresDetectadas = [];
  for (const [corNome, pattern] of Object.entries(corPatterns)) {
    if (desc.match(pattern)) {
      coresDetectadas.push(corNome);
    }
  }

  // Se detectou múltiplas cores, junta com "/"
  if (coresDetectadas.length > 1) {
    cor = coresDetectadas.join('/');
  } else if (coresDetectadas.length === 1) {
    cor = coresDetectadas[0];
  }

  // MAPEAMENTO ESPECÍFICO POR CÓDIGO - tem precedência sobre detecção automática
  const codigoParaCor = {
    // Códigos que começam com 00077
    '00077': 'BRANCO',
    // Códigos que começam com 00080
    '00080': 'BRONZE',
    // Códigos específicos
    '00081': 'VERMELHO',
    '00090': 'VERMELHO',
    '00091': 'BRANCO',
    '00099': 'BRANCO/VERDE',
    '000116': 'ROSA',
    '000120': 'BRANCO/ROSA',
    '000123': 'ROSA',
    '000129': 'AMARELO',
    '000131': 'AMARELO',
    '000141': 'VARIADA',
    '000167': 'VERMELHO',
    '000186': 'CHA',
    '000194': 'ROSA',
    '000201': 'SALMAO',
    '000216': 'ROSA',
    '000229': 'BRANCO',
    '000230': 'AMARELO',
    '000250': 'AMARELO',
    '000253': 'AMARELO',
    '000265': 'AMARELO',
    '000269': 'AMARELO',
    '000291': 'VARIADA',
    '000401': 'BRANCO',
    '000546': 'BRANCO',
    '000552': 'VARIADA'
  };

  // Verifica mapeamento específico por código
  if (!cor) {
    // Primeiro verifica códigos exatos
    for (const [codigoPrefix, corMapeada] of Object.entries(codigoParaCor)) {
      if (codigo.startsWith(codigoPrefix)) {
        cor = corMapeada;
        break;
      }
    }
  }

  // TRATATIVA ESPECIAL PARA CRASPEDIAS: códigos que começam com 00004 são amarelas por padrão
  // Exceto as que terminam com .04 que são vermelhas
  if (!cor && codigo.startsWith('00004') && !codigo.endsWith('.04')) {
    cor = 'AMARELO';
  }

  // TRATATIVA GERAL: códigos que terminam com .04 são vermelhos quando cor estiver null
  if (!cor && codigo.endsWith('.04')) {
    cor = 'VERMELHO';
  }

  // TRATATIVA ESPECIAL: códigos que começam com 00050 são brancos quando cor estiver null
  if (!cor && codigo.startsWith('00050')) {
    cor = 'BRANCO';
  }

  // TRATATIVA ESPECIAL: códigos que começam com 00068 são rosa quando cor estiver null
  if (!cor && codigo.startsWith('00068')) {
    cor = 'ROSA';
  }

  // Se detectou cor(s), remove apenas as ocorrências em Português da descrição limpa.
  // Mantém nomes em inglês visíveis em descricao_comercial.
  if (cor) {
    const portugueseColorWords = ['BRANCO', 'BCO', 'ROSA', 'VERMELHO', 'VERM', 'LILAS', 'ROXO', 'AMARELO', 'LARANJA', 'LA', 'AZUL', 'VERDE', 'SALMAO', 'CHAMPANHE', 'CREME', 'CRE', 'BICOLOR', 'VINHO', 'BRONZE', 'PRETO', 'CHA', 'VARIADA', 'VARIADO'];
    for (const word of portugueseColorWords) {
      descLimpa = descLimpa.replace(new RegExp('\\b' + word + '\\b', 'gi'), ' ').replace(/\s+/g, ' ').trim();
    }
    // Also remove common truncated color tokens that sometimes remain (e.g. "CRE", "CHA",
    // or the English word CHAMPAGNE when the Portuguese token was used for detection).
    // This prevents leftover fragments like "Champagne Cre" in `descricao_comercial`.
    descLimpa = descLimpa
      .replace(/\bCRE\b/gi, ' ')
      .replace(/\bCHA\b/gi, ' ')
      .replace(/\bCHAMPAGNE\b/gi, ' ')
      .replace(/\bCHAMP\b/gi, ' ')
      .replace(/\bCREME\b/gi, ' ')
      .replace(/\bCREAM\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Extrai nível comercial
  let nivelComercial = null;
  if (desc.match(/PREMIUM|PREM/i)) nivelComercial = 'PREMIUM';
  if (desc.match(/DECORADO|DECOR/i)) nivelComercial = 'DECORADO';
  if (desc.match(/COLECAO/i)) nivelComercial = 'COLECAO';
  if (desc.match(/COLOURS/i)) nivelComercial = 'COLOURS';

  // Limpeza final: remove palavras-chave isoladas que sobraram

  descLimpa = descLimpa
    .replace(/^L\s+/gi, 'LISIANTHUS ')
    .replace(/\bL\.\s*/gi, 'LISIANTHUS ')
    .replace(/\bLIS\.\s*/gi, 'LISIANTHUS ')
    .replace(/\bPL\.\s*/gi, 'PLUMOSA ')
    .replace(/\bA\.NEO\b/gi, 'AMAZON NEON')
    .replace(/\bA\.NEON\b/gi, 'AMAZON NEON')
    .replace(/\bA\.ROSE\b/gi, 'AMAZON ROSE')
    .replace(/\bCR\.(?=[A-Z])/gi, 'CR. ') // Adiciona espaço depois de CR. se seguido de letra maiúscula
    .replace(/\bDIAM\b/gi, '')
    .replace(/\bHA\b/gi, '')
    .replace(/\bHT\b/gi, '')
    .replace(/\bFL\b/gi, '')
    .replace(/\bFLS\b/gi, '')
    .replace(/\bCM\b/gi, '')
    .replace(/\bC\b/gi, '')
    .replace(/\bMIN\b/gi, '')
    .replace(/\b(?:GRAMAS?|GRAMS?|GRA|GRAM)\b/gi, '')
    .replace(/\bHAST\b/gi, '') // Remove HAST leftover
    .replace(/\bP\b/gi, '') // Remove P leftover (assuming it's not part of other words)
    .replace(/\bPOR\b/gi, '') // Remove POR leftover
    .replace(/\bPO\b/gi, '') // Remove PO leftover
    // CORES NÃO SÃO MAIS REMOVIDAS - mantidas na descrição comercial
    // .replace(/\b(?:BRANCO|BCO|WHITE|SNOW|ROSA|ROSE|PINK|ROS|VERMELHO|RED|VERM|LILAS|LILAC|ROXO|PURPLE|VIOLET|AMARELO|YELLOW|LARANJA|BRONZE|AZUL|BLUE|VERDE|GREEN|SALMAO|SALMON|CHAMPAGNE|BICOLOR|VINHO|PRETO|BLACK|LA)\b/gi, '')
    // Preserva DARK ORANGE quando for parte do nome da variedade (não remove)
    .replace(/\bDARK\s+ORANGE\b/gi, 'DARK ORANGE')
    // Preserva D.ORAN quando for parte do nome da variedade (não remove)
    .replace(/\bD\.ORAN\b/gi, 'D.ORAN')
    // Remove barras isoladas que sobram após remoção de cores
    .replace(/\s*\/\s*/g, ' ')
    // Remove parênteses vazios
    .replace(/\(\s*\)/g, '')
    // Remove números isolados que sobraram (ex: após remover "BCO 2 HAST" vira "2")
    .replace(/\s+\d+\s*$/i, '')
    .replace(/\s+\d+\s+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    produtoBase,
    variedade,
    tipoProduto,
    tipoEmbalagem,
    numeroPote,
    numeroHashtes,
    numeroFlores,
    alturaCm,
    diametroFlorCm,
    gramas,
    cor,
    nivelComercial,
    codigoVeiling: codigo,
    descricaoOriginal: desc,
    // Aplica capitalização, substituições e remove ponto final
    descricaoComercial: capitalize(descLimpa)
      .replace(/\bGERB(ERA)?\b/gi, 'Gerbera')
      .replace(/\bALST(ROMERIA|ROMÉLIA|ROMELIA)?\b/gi, 'Alstroemeria')
      .replace(/\bASTROMELIA\b/g, 'Alstroemeria ')
      .replace(/\bASTER\b/g, 'Aster')
      .replace(/\bAST\s+D\.\s*/gi, 'Aster Dobrado ')
      .replace(/\bAST\b/gi, 'Aster')
      .replace(/\bGUZM\.?\s*/gi, 'Bromélia Guzmânia ')
      .replace(/\bRANUN\.?\s+/gi, 'Ranunculus ')
      .replace(/\bLIS\b/gi, 'Lisianthus')
      .replace(/\bMesc\b/gi, 'Mesclado')
      .replace(/\bMACO\b/gi, 'Maço')
      .replace(/^Anth\b/gi, 'Antúrio')
      .replace(/\bANTH\b/gi, 'Antúrio')
      .replace(/\bANTÚRIO\b/g, 'Antúrio')
      .replace(/\bANTHURIUM\b/gi, 'Antúrio')
      .replace(/\bAnturio\b/gi, 'Antúrio')
      .replace(/\bCRISANTEMO\b/gi, 'Crisântemo')
      .replace(/\bCrisantemo\b/g, 'Crisântemo')
      .replace(/\bCRISÂNTEMO\b/gi, 'Crisântemo')
      .replace(/\bCRIS\s+SANTINI\b/gi, 'Crisântemo Santini')
      .replace(/\bCRIS\b(?!\s*[aâ]ntemo\b)/gi, 'Crisântemo')
      .replace(/(?<!Crisântemo\s)\bSANTINI\b/gi, 'Crisântemo Santini')  // Don't replace SANTINI if preceded by "Crisântemo "
      .replace(/\bSANT\b/gi, 'Crisântemo Santini')
      .replace(/\bPHAL\b/gi, 'Phalaenopsis')
      .replace(/\bPha\b/gi, 'Phalaenopsis')
      .replace(/\bMi\b/gi, 'Mista')
      .replace(/\bGYPSO\b/gi, 'Gypsophila')
      .replace(/\bGLAD\b/gi, 'Gladíolo')
      .replace(/\bQuad\b/gi, 'Quadrado')
      .replace(/\bCR\.(?!\w)/gi, 'Cristata ') // CR. seguido de espaço ou fim, não seguido de letra
      .replace(/\bPIT\.?\s*(?!osporo)/gi, 'Pitosporo ')
      .replace(/\bARGE?\b/gi, 'Argentea')
      .replace(/\bFOLH\b/gi, 'Folhagem')
      .replace(/\bZANTED\b/gi, 'Zantedeschia')
      .replace(/\bPREM\b/gi, 'Premium')
      .replace(/\bPREMIU\b/gi, 'Premium')
      .replace(/\bPRE\b(?!\w)/gi, 'Premium')
      .replace(/\bPremi\b/gi, 'Premium')
      .replace(/\bPERF\b/gi, 'Perfilhado')
      .replace(/\bMultif\b/gi, 'Multiflora')
      .replace(/\bMUL\b/gi, 'Multiflora')
      .replace(/\bBeauc\b/gi, 'Beaucarnea')
      .replace(/\bGuatem\b/gi, 'Guatemalense')
      .replace(/\bAngustifol\b/gi, 'Angustifolia')
      // Lirio sem acento -> Lírio (case insensitive)
      .replace(/\bLIRIO\b/gi, 'Lírio')
      // Lirio Orient/Orien/Or + número (com ou sem ponto, com ou sem acento)
      .replace(/L[íi]rio Orien?t?\.?\s*(\d{2,3})\b/gi, function (_, num) {
        return `Lírio Oriental ${parseInt(num, 10)} CM`;
      })
      .replace(/L[íi]rio Orient\b/gi, 'Lírio Oriental')
      .replace(/L[íi]rio Orien\./gi, 'Lírio Oriental')
      .replace(/L[íi]rio Or\./gi, 'Lírio Oriental')
      // Correções de capitalização para nomes próprios
      .replace(/\bMccarran\b/g, 'McCarran')
      // D Splend -> Dark Splend
      .replace(/\bD\s+SPLEND\b/gi, 'Dark Splend')
      // D. ORAN -> Dark Orange
      .replace(/\bD\.?\s*ORAN\b/gi, 'Dark Orange')
      // Só coloca ponto se Astromélia for a última palavra isolada
      .replace(/^(Astromélia)$/, 'Astromélia.')
      .replace(/(Astromélia)$/, 'Astromélia.')
      .replace(/Astromélia\.\s+(\w+)/g, 'Astromélia $1')
      .replace(/\.(?=\.)/g, '') // evita duplo ponto
      .replace(/\b(\w+)\s+\1\b/gi, '$1') // remove palavras duplicadas consecutivas
      .replace(/\bvariegato\b/gi, 'Variegato')
      .replace(/\bPerf\w+\b/gi, (match) => match.toLowerCase() === 'perfilhado' ? match : '')
      .replace(/\bMultif\w+\b/gi, (match) => match.toLowerCase() === 'multiflora' ? match : '')
      .trim()
  };
}

// Parse todos os produtos
const produtosMap = new Map();
const conjuntosComerciais = [];
const usedSlugs = new Set();

lines.forEach((line, index) => {
  const [codigo, descricao] = line.split(';');
  if (!codigo || !descricao) return;

  // Remove aspas e espaços extras da descrição
  const descLimpa = descricao.replace(/^["'\s]+|["'\s]+$/g, '').replace(/"{2,}/g, '"');
  const descOriginal = descricao.replace(/^["'\s]+|["'\s]+$/g, '').replace(/"{2,}/g, '"');

  const dados = parseDescricao(codigo.trim(), descLimpa);

  // Adiciona ao mapa de produtos base
  if (!produtosMap.has(dados.produtoBase)) {
    const slug = generateSlug(dados.produtoBase, usedSlugs);
    produtosMap.set(dados.produtoBase, {
      id: slug,
      produto_base: dados.produtoBase,
      tipo_produto: dados.tipoProduto,
      descricao: capitalize(dados.produtoBase),
      status: 'ATIVO',
      galeria_principal: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  // Adiciona conjunto comercial
  const produtoBaseId = produtosMap.get(dados.produtoBase).id;
  const slug = generateSlug(dados.descricaoOriginal, usedSlugs);

  conjuntosComerciais.push({
    id: slug,
    produto_id: produtoBaseId,
    variedade: dados.variedade,
    nivel_comercial: dados.nivelComercial,
    tipo_produto: dados.tipoProduto,
    tipo_embalagem: dados.tipoEmbalagem,
    numero_pote: dados.numeroPote,
    numero_hastes: dados.numeroHashtes,
    numero_flores: dados.numeroFlores,
    altura_cm: dados.alturaCm,
    diametro_flor_cm: dados.diametroFlorCm,
    gramas: dados.gramas,
    cor: dados.cor,
    codigo_veiling: dados.codigoVeiling,
    descricao_comercial: dados.descricaoComercial,
    descricao_original: dados.descricaoOriginal,
    preco_venda_sugerido: 0,
    historico_precos: [],
    imagens: [],
    ativo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  if ((index + 1) % 1000 === 0) {
    console.log(`✅ Processados ${index + 1} de ${lines.length} produtos...`);
  }
});

// Converte produtos base para array
const produtosBase = Array.from(produtosMap.values());

// Salva arquivos
const outputDir = path.join(__dirname, 'data');

fs.writeFileSync(
  path.join(outputDir, 'produtos-base.json'),
  JSON.stringify(produtosBase, null, 2)
);

fs.writeFileSync(
  path.join(outputDir, 'conjuntos-comerciais.json'),
  JSON.stringify(conjuntosComerciais, null, 2)
);

console.log(`\n🎉 CONCLUÍDO!`);
console.log(`📦 Produtos Base: ${produtosBase.length}`);
console.log(`🌸 Conjuntos Comerciais: ${conjuntosComerciais.length}`);
console.log(`\n✅ Arquivos salvos em:`);
console.log(`   - data/produtos-base.json`);
console.log(`   - data/conjuntos-comerciais.json`);
