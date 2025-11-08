import { prisma } from '@terraviva/db-catalogo-pft'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/catalogos/:id - Buscar catálogo por ID
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params // ✅ agora é síncrono
    console.log('ID recebido:', id)

    const catalogo = await prisma.catalogo.findUnique({
      where: { id }
    })

    if (!catalogo) {
      return NextResponse.json(
        { message: 'Catálogo não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(catalogo)
  } catch (error) {
    console.error('Erro ao buscar catálogo:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/catalogos/:id - Editar um catálogo
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    console.log('ID recebido:', id)

    const data = await request.json()

    const {
      slug,
      title,
      caption,
      banner,
      cover,
      sellerName,
      phoneContact,
      availabilityStart,
      availabilityEnd,
      sections
    } = data

    console.log('Dados recebidos:', data)

    const catalogoExistente = await prisma.catalogo.findUnique({
      where: { id }
    })

    let catalogoAtualizado

    if (catalogoExistente) {
      // Update existing catalog
      catalogoAtualizado = await prisma.catalogo.update({
        where: { id },
        data: {
          slug,
          title,
          caption: caption || null,
          banner: banner || null,
          cover,
          sellerName,
          phoneContact,
          availabilityStart: availabilityStart || null,
          availabilityEnd: availabilityEnd || null,
          sections: sections || []
        }
      })
    } else {
      // Create new catalog if it doesn't exist
      catalogoAtualizado = await prisma.catalogo.create({
        data: {
          id,
          slug,
          title,
          caption: caption || null,
          banner: banner || null,
          cover,
          sellerName,
          phoneContact,
          availabilityStart: availabilityStart || null,
          availabilityEnd: availabilityEnd || null,
          sections: sections || []
        }
      })
    }

    return NextResponse.json(catalogoAtualizado)
  } catch (error) {
    console.error('Erro ao atualizar catálogo:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/catalogos/:id - Excluir um catálogo
export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params // ✅ agora é síncrono
  console.log('ID recebido:', id)

  try {
    const catalogo = await prisma.catalogo.findUnique({ where: { id } })

    if (!catalogo) {
      return Response.json(
        { error: 'Catálogo não encontrado' },
        { status: 404 }
      )
    }

    await prisma.catalogo.delete({ where: { id } })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir catálogo:', error)
    return Response.json(
      { error: 'Erro interno ao excluir catálogo' },
      { status: 500 }
    )
  }
}
