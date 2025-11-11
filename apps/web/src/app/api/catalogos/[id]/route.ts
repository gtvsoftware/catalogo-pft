import { BlobServiceClient } from '@azure/storage-blob'
import { prisma } from '@terraviva/db-catalogo-pft'
import { NextRequest, NextResponse } from 'next/server'

import { authWrapper } from '@/utils/authWrapper'

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING
const containerName =
  process.env.AZURE_STORAGE_CONTAINER_NAME || 'catalogo-images'

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
    const session = await authWrapper()

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
      sharedWith,
      sections
    } = data

    const catalogoExistente = await prisma.catalogo.findUnique({
      where: { id }
    })

    if (catalogoExistente) {
      const existingSeller = catalogoExistente.seller as any
      if (existingSeller?.id && existingSeller.id !== session.user.oid) {
        return NextResponse.json(
          { message: 'Você não tem permissão para editar este catálogo' },
          { status: 403 }
        )
      }
    }

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
          sharedWith: sharedWith || [],
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
          sharedWith: sharedWith || [],
          sections: sections || []
        }
      })
    }

    try {
      if (seller?.id) {
        const now = new Date()

        await prisma.$runCommandRaw({
          update: 'sellers',
          updates: [
            {
              q: { _id: seller.id },
              u: {
                $set: {
                  _id: seller.id,
                  name: seller.name ?? null,
                  picture: seller.picture ?? null,
                  updated_at: now
                },
                $setOnInsert: { created_at: now }
              },
              upsert: true
            }
          ]
        })
      }
    } catch (err) {
      console.error('Erro ao upsert seller:', err)
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
  const session = await authWrapper()

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

    const seller = catalogo.seller as any
    if (seller?.id && seller.id !== session.user.oid) {
      return Response.json(
        { error: 'Você não tem permissão para excluir este catálogo' },
        { status: 403 }
      )
    }

    if (connectionString) {
      try {
        const blobServiceClient =
          BlobServiceClient.fromConnectionString(connectionString)
        const containerClient =
          blobServiceClient.getContainerClient(containerName)

        const prefix = `${id}/`
        for await (const blob of containerClient.listBlobsFlat({
          prefix
        })) {
          const blobClient = containerClient.getBlobClient(blob.name)
          await blobClient.deleteIfExists()
        }
      } catch (azureError) {
        console.error('Erro ao deletar imagens do Azure:', azureError)
      }
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
