import { randomUUID } from 'node:crypto'
import { prisma } from '@terraviva/database-pft'

import conjuntosComerciais from './data/conjuntos-comerciais.json'

async function seedConjuntos() {
  try {
    console.log(
      JSON.stringify({
        type: 'start',
        message: 'Starting to seed conjuntos comerciais'
      })
    )

    await prisma.conjuntoComercial.deleteMany({})
    console.log(
      JSON.stringify({
        type: 'progress',
        message: 'Deleted existing conjuntos comerciais'
      })
    )

    const total = conjuntosComerciais.length
    let processed = 0

    for (const conjunto of conjuntosComerciais) {
      await prisma.conjuntoComercial.create({
        data: {
          id: randomUUID(),
          slug: conjunto.id,
          variedade: conjunto.variedade,
          nivelComercial: conjunto.nivel_comercial,
          tipoProduto: conjunto.tipo_produto,
          tipoEmbalagem: conjunto.tipo_embalagem || 'N/A',
          numeroPote: conjunto.numero_pote,
          numeroHashtes: conjunto.numero_hastes,
          alturaCm: conjunto.altura_cm,
          cor: conjunto.cor,
          codigoVeiling: conjunto.codigo_veiling,
          descricaoComercial: conjunto.descricao_comercial,
          precoVendaSugerido: conjunto.preco_venda_sugerido,
          historicoPrecos: conjunto.historico_precos.join(';'),
          imagens: conjunto.imagens.join(';'),
          ativo: true,
          descricaoOriginal: conjunto.descricao_original,
          diametroFlorCm: conjunto.diametro_flor_cm,
          numeroFlores: conjunto.numero_flores,
          produtoBase: {
            connect: {
              id: (
                await prisma.produtoBase.findFirstOrThrow({
                  where: {
                    slug: conjunto.produto_id
                  }
                })
              ).id
            }
          },
          createdAt: new Date()
        }
      })

      processed++
      if (processed % 10 === 0 || processed === total) {
        console.log(
          JSON.stringify({
            type: 'progress',
            message: `Processed ${processed}/${total} conjuntos`
          })
        )
      }
    }

    console.log(
      JSON.stringify({
        type: 'success',
        message: 'Seeded conjuntos comerciais successfully'
      })
    )
  } catch (error) {
    console.log(error)
    console.log(
      JSON.stringify({
        type: 'error',
        message: 'Failed to seed conjuntos comerciais',
        error: error.message
      })
    )
  } finally {
    process.exit(0)
  }
}

seedConjuntos()
