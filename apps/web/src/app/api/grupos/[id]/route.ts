import { prisma } from '@terraviva/db-catalogo-pft'
import { NextRequest, NextResponse } from 'next/server'


export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const grupo = await prisma.grupo.findUnique({
      where: {
        id
      }
    })

    if (!grupo) {
      return NextResponse.json(
        { message: 'Grupo não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(grupo)
  } catch (error) {
    console.error('Erro ao buscar grupo:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}


export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const body = await request.json()
    const { nome, slug, tipoProduto, status, descricao, imagem } = body

    
    const grupoExistente = await prisma.grupo.findUnique({
      where: { id }
    })

    if (!grupoExistente) {
      return NextResponse.json(
        { message: 'Grupo não encontrado' },
        { status: 404 }
      )
    }

    
    if (slug !== grupoExistente.slug) {
      const slugExistente = await prisma.grupo.findUnique({
        where: { slug }
      })

      if (slugExistente) {
        return NextResponse.json(
          { message: 'Já existe um grupo com este slug' },
          { status: 400 }
        )
      }
    }

    
    const grupoAtualizado = await prisma.grupo.update({
      where: { id: id },
      data: {
        nome,
        slug,
        tipoProduto,
        status,
        descricao,
        imagem: imagem || null
      }
    })

    
    if (slug !== grupoExistente.slug) {
      await prisma.serie.updateMany({
        where: { grupoId: id },
        data: { grupoSlug: slug, grupoNome: nome }
      })

      await prisma.variacao.updateMany({
        where: { grupoId: id },
        data: { grupoSlug: slug }
      })
    } else if (nome !== grupoExistente.nome) {
      
      await prisma.serie.updateMany({
        where: { grupoId: id },
        data: { grupoNome: nome }
      })
    }

    return NextResponse.json(grupoAtualizado)
  } catch (error) {
    console.error('Erro ao atualizar grupo:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}


export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    
    const grupo = await prisma.grupo.findUnique({
      where: { id: params.id },
      include: {
        series: true,
        variacoes: true
      }
    })

    if (!grupo) {
      return NextResponse.json(
        { message: 'Grupo não encontrado' },
        { status: 404 }
      )
    }

    
    if (grupo.series.length > 0 || grupo.variacoes.length > 0) {
      return NextResponse.json(
        {
          message:
            'Não é possível excluir este grupo pois existem séries ou variações vinculadas. Exclua-as primeiro.'
        },
        { status: 400 }
      )
    }

    
    await prisma.grupo.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Grupo excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar grupo:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
