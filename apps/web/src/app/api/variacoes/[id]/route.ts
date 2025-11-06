import { prisma } from '@terraviva/db-catalogo-pft'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/variacoes/[id] - Buscar uma variação específica
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const variacao = await prisma.variacao.findUnique({
      where: { id },
      include: {
        grupo: true,
        serie: true
      }
    })

    if (!variacao) {
      return NextResponse.json(
        { message: 'Variação não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(variacao)
  } catch (error) {
    console.error('Erro ao buscar variação:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/variacoes/[id] - Atualizar uma variação
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const body = await request.json()
    const {
      variacaoId,
      grupoId,
      serieId,
      variedade,
      nivelComercial,
      tipoEmbalagem,
      embalagemVariedade,
      embalagemMaterial,
      embalagemFormato,
      bulbos,
      numeroPote,
      numeroHashtes,
      numeroFlores,
      alturaCm,
      diametroFlorCm,
      gramas,
      litros,
      cor,
      tingida,
      codigoVeiling,
      descricaoComercial,
      descricaoCompleta,
      descricaoOriginal,
      precoVendaSugerido,
      imagens,
      ativo
    } = body

    // Verificar se a variação existe
    const variacaoExistente = await prisma.variacao.findUnique({
      where: { id }
    })

    if (!variacaoExistente) {
      return NextResponse.json(
        { message: 'Variação não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se o grupo existe
    const grupo = await prisma.grupo.findUnique({
      where: { id: grupoId }
    })

    if (!grupo) {
      return NextResponse.json(
        { message: 'Grupo não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se a série existe
    const serie = await prisma.serie.findUnique({
      where: { id: serieId }
    })

    if (!serie) {
      return NextResponse.json(
        { message: 'Série não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se o variacaoId já existe em outra variação
    if (variacaoId !== variacaoExistente.variacaoId) {
      const variacaoIdExistente = await prisma.variacao.findUnique({
        where: { variacaoId }
      })

      if (variacaoIdExistente) {
        return NextResponse.json(
          { message: 'Já existe uma variação com este ID' },
          { status: 400 }
        )
      }
    }

    // Verificar se o código veiling já existe em outra variação
    if (codigoVeiling !== variacaoExistente.codigoVeiling) {
      const codigoExistente = await prisma.variacao.findUnique({
        where: { codigoVeiling }
      })

      if (codigoExistente) {
        return NextResponse.json(
          { message: 'Já existe uma variação com este código veiling' },
          { status: 400 }
        )
      }
    }

    // Atualizar a variação
    const variacaoAtualizada = await prisma.variacao.update({
      where: { id },
      data: {
        variacaoId,
        grupoId,
        serieId,
        grupoSlug: grupo.slug,
        serieSlug: serie.slug,
        variedade: variedade || null,
        nivelComercial: nivelComercial || null,
        tipoEmbalagem: tipoEmbalagem || null,
        embalagemVariedade: embalagemVariedade || null,
        embalagemMaterial: embalagemMaterial || null,
        embalagemFormato: embalagemFormato || null,
        bulbos: bulbos || null,
        numeroPote: numeroPote || null,
        numeroHashtes: numeroHashtes || null,
        numeroFlores: numeroFlores || null,
        alturaCm: alturaCm || null,
        diametroFlorCm: diametroFlorCm || null,
        gramas: gramas || null,
        litros: litros || null,
        cor: cor || null,
        tingida: tingida || false,
        codigoVeiling,
        descricaoComercial: descricaoComercial || '',
        descricaoCompleta: descricaoCompleta || '',
        descricaoOriginal: descricaoOriginal || '',
        precoVendaSugerido: precoVendaSugerido || 0,
        imagens: imagens || [],
        ativo: ativo !== undefined ? ativo : true
      }
    })

    return NextResponse.json(variacaoAtualizada)
  } catch (error) {
    console.error('Erro ao atualizar variação:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/variacoes/[id] - Deletar uma variação
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    // Verificar se a variação existe
    const variacao = await prisma.variacao.findUnique({
      where: { id }
    })

    if (!variacao) {
      return NextResponse.json(
        { message: 'Variação não encontrada' },
        { status: 404 }
      )
    }

    // Deletar a variação
    await prisma.variacao.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Variação excluída com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar variação:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
