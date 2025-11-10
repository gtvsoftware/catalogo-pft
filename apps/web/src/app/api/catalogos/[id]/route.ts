import { prisma } from '@terraviva/db-catalogo-pft'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    // Check if id is a MongoDB ObjectId (24 hex characters) or a slug
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id)

    const catalogo = isObjectId
      ? await prisma.catalogo.findUnique({
          where: { id }
        })
      : await prisma.catalogo.findUnique({
          where: { slug: id }
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

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

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

    const catalogoExistente = await prisma.catalogo.findUnique({
      where: { id }
    })

    let catalogoAtualizado

    if (catalogoExistente) {
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

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

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
