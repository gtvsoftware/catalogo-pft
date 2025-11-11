import { auth } from '@terraviva/auth'
import { prisma } from '@terraviva/db-catalogo-pft'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

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
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await context.params

    const data = await request.json()

    const {
      slug,
      title,
      cover,
      seller,
      phoneContact,
      availabilityStart,
      availabilityEnd,
      sections
    } = data

    const catalogoExistente = await prisma.catalogo.findUnique({
      where: { id }
    })

    // If catalog exists, verify the user is the owner
    if (catalogoExistente) {
      const existingSeller = catalogoExistente.seller as any
      if (existingSeller?.id && existingSeller.id !== session.user.oid) {
        return NextResponse.json(
          { message: 'Você não tem permissão para editar este catálogo' },
          { status: 403 }
        )
      }
    }

    // Verify the seller in the data matches the logged user
    if (seller?.id && seller.id !== session.user.oid) {
      return NextResponse.json(
        { message: 'Você não pode atribuir este catálogo a outro vendedor' },
        { status: 403 }
      )
    }

    let catalogoAtualizado

    if (catalogoExistente) {
      catalogoAtualizado = await prisma.catalogo.update({
        where: { id },
        data: {
          slug,
          title,
          cover,
          seller,
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
          cover,
          seller,
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
  const session = await auth()

  if (!session?.user) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { id } = await context.params

  try {
    const catalogo = await prisma.catalogo.findUnique({ where: { id } })

    if (!catalogo) {
      return Response.json(
        { error: 'Catálogo não encontrado' },
        { status: 404 }
      )
    }

    // Verify the user is the owner
    const seller = catalogo.seller as any
    if (seller?.id && seller.id !== session.user.oid) {
      return Response.json(
        { error: 'Você não tem permissão para excluir este catálogo' },
        { status: 403 }
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
