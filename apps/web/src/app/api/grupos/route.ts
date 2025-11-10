import { prisma } from '@terraviva/db-catalogo-pft'
import { NextRequest, NextResponse } from 'next/server'


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const tipoProduto = searchParams.get('tipoProduto')
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const skip = (page - 1) * limit

    const where: any = {}

    if (status) {
      where.status = status
    }

    if (tipoProduto) {
      where.tipoProduto = tipoProduto
    }

    
    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { descricao: { contains: search, mode: 'insensitive' } }
      ]
    }

    
    const total = await prisma.grupo.count({ where })

    const grupos = await prisma.grupo.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        nome: 'asc'
      },
      include: {
        _count: {
          select: {
            series: true,
            variacoes: true
          }
        }
      }
    })

    return NextResponse.json({
      grupos,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Erro ao listar grupos:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nome, slug, tipoProduto, status, descricao, imagem } = body

    
    if (!nome || !slug || !tipoProduto || !descricao) {
      return NextResponse.json(
        { message: 'Campos obrigatórios faltando' },
        { status: 400 }
      )
    }

    
    const slugExistente = await prisma.grupo.findUnique({
      where: { slug }
    })

    if (slugExistente) {
      return NextResponse.json(
        { message: 'Já existe um grupo com este slug' },
        { status: 400 }
      )
    }

    
    const novoGrupo = await prisma.grupo.create({
      data: {
        nome,
        slug,
        tipoProduto,
        status: status || 'ATIVO',
        descricao,
        imagem: imagem || null
      }
    })

    return NextResponse.json(novoGrupo, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar grupo:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
