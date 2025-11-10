import { prisma } from '@terraviva/db-catalogo-pft'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const grupoId = searchParams.get('grupoId')
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const skip = (page - 1) * limit

    const where: any = {}

    if (grupoId) {
      where.grupoId = grupoId
    }

    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { grupoNome: { contains: search, mode: 'insensitive' } }
      ]
    }

    const total = await prisma.serie.count({ where })

    const series = await prisma.serie.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        nome: 'asc'
      },
      include: {
        grupo: true,
        _count: {
          select: {
            variacoes: true
          }
        }
      }
    })

    return NextResponse.json({
      series,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Erro ao listar séries:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nome, slug, grupoId, imagem } = body

    if (!nome || !slug || !grupoId) {
      return NextResponse.json(
        { message: 'Campos obrigatórios faltando' },
        { status: 400 }
      )
    }

    const grupo = await prisma.grupo.findUnique({
      where: { id: grupoId }
    })

    if (!grupo) {
      return NextResponse.json(
        { message: 'Grupo não encontrado' },
        { status: 404 }
      )
    }

    const slugExistente = await prisma.serie.findUnique({
      where: { slug }
    })

    if (slugExistente) {
      return NextResponse.json(
        { message: 'Já existe uma série com este slug' },
        { status: 400 }
      )
    }

    const novaSerie = await prisma.serie.create({
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

    return NextResponse.json(novaSerie, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar série:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
