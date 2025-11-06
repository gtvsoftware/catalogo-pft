import { prisma } from '@terraviva/db-catalogo-pft'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/series/[id] - Buscar uma série específica
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const serie = await prisma.serie.findUnique({
      where: { id },
      include: {
        grupo: true
      }
    })

    if (!serie) {
      return NextResponse.json(
        { message: 'Série não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(serie)
  } catch (error) {
    console.error('Erro ao buscar série:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/series/[id] - Atualizar uma série
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const body = await request.json()
    const { nome, slug, grupoId, imagem } = body

    // Verificar se a série existe
    const serieExistente = await prisma.serie.findUnique({
      where: { id }
    })

    if (!serieExistente) {
      return NextResponse.json(
        { message: 'Série não encontrada' },
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

    // Verificar se o slug já existe em outra série
    if (slug !== serieExistente.slug) {
      const slugExistente = await prisma.serie.findUnique({
        where: { slug }
      })

      if (slugExistente) {
        return NextResponse.json(
          { message: 'Já existe uma série com este slug' },
          { status: 400 }
        )
      }
    }

    // Atualizar a série
    const serieAtualizada = await prisma.serie.update({
      where: { id },
      data: {
        nome,
        slug,
        grupoId,
        grupoSlug: grupo.slug,
        grupoNome: grupo.nome,
        tipoProduto: grupo.tipoProduto,
        imagem: imagem || null
      }
    })

    // Se o slug foi alterado, atualizar as referências em variações
    if (slug !== serieExistente.slug) {
      await prisma.variacao.updateMany({
        where: { serieId: id },
        data: { serieSlug: slug }
      })
    }

    return NextResponse.json(serieAtualizada)
  } catch (error) {
    console.error('Erro ao atualizar série:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/series/[id] - Deletar uma série
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    // Verificar se a série existe
    const serie = await prisma.serie.findUnique({
      where: { id },
      include: {
        variacoes: true
      }
    })

    if (!serie) {
      return NextResponse.json(
        { message: 'Série não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se existem variações vinculadas
    if (serie.variacoes.length > 0) {
      return NextResponse.json(
        {
          message:
            'Não é possível excluir esta série pois existem variações vinculadas. Exclua-as primeiro.'
        },
        { status: 400 }
      )
    }

    // Deletar a série
    await prisma.serie.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Série excluída com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar série:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
