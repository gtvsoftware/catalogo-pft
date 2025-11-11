import { prisma } from '@terraviva/db-catalogo-pft'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const sellerOid = searchParams.get('sellerOid')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { caption: { contains: search, mode: 'insensitive' } }
      ]
    }

    // First, get all catalogos matching the search criteria
    let catalogos = await prisma.catalogo.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    // Filter by seller if sellerOid is provided
    if (sellerOid) {
      catalogos = catalogos.filter((catalogo: any) => {
        return catalogo.seller && catalogo.seller.id === sellerOid
      })
    }

    // Calculate total and apply pagination manually
    const total = catalogos.length
    const paginatedCatalogos = catalogos.slice(skip, skip + limit)

    return NextResponse.json({
      catalogos: paginatedCatalogos,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Erro ao listar catálogos:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    let body: any

    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const dataStr = formData.get('data') as string
      body = JSON.parse(dataStr)
    } else {
      body = await request.json()
    }

    const { title, caption, banner, sections } = body

    if (!title) {
      return NextResponse.json(
        { message: 'Título é obrigatório' },
        { status: 400 }
      )
    }

    const novoCatalogo = await prisma.catalogo.create({
      data: {
        title,
        caption: caption || null,
        banner: banner || null,
        sections: sections || []
      }
    })

    return NextResponse.json(novoCatalogo, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar catálogo:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
