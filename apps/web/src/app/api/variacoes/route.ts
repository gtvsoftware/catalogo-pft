import { prisma } from '@terraviva/db-catalogo-pft'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const grupoId = searchParams.get('grupoId')
    const serieId = searchParams.get('serieId')
    const ativo = searchParams.get('ativo')
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const skip = (page - 1) * limit

    const where: any = {}

    if (grupoId) {
      where.grupoId = grupoId
    }

    if (serieId) {
      where.serieId = serieId
    }

    if (ativo !== null && ativo !== undefined && ativo !== '') {
      where.ativo = ativo === 'true'
    }

    if (search) {
      where.OR = [
        { descricaoComercial: { contains: search, mode: 'insensitive' } },
        { descricaoCompleta: { contains: search, mode: 'insensitive' } },
        { codigoVeiling: { contains: search, mode: 'insensitive' } },
        { variacaoId: { contains: search, mode: 'insensitive' } },
        { cor: { contains: search, mode: 'insensitive' } }
      ]
    }

    const total = await prisma.variacao.count({ where })

    const variacoes = await prisma.variacao.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        descricaoComercial: 'asc'
      },
      include: {
        grupo: true,
        serie: true
      }
    })

    return NextResponse.json({
      variacoes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Erro ao listar variações:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    if (!variacaoId || !grupoId || !serieId || !codigoVeiling) {
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

    const serie = await prisma.serie.findUnique({
      where: { id: serieId }
    })

    if (!serie) {
      return NextResponse.json(
        { message: 'Série não encontrada' },
        { status: 404 }
      )
    }

    const variacaoIdExistente = await prisma.variacao.findUnique({
      where: { variacaoId }
    })

    if (variacaoIdExistente) {
      return NextResponse.json(
        { message: 'Já existe uma variação com este ID' },
        { status: 400 }
      )
    }

    const codigoExistente = await prisma.variacao.findUnique({
      where: { codigoVeiling }
    })

    if (codigoExistente) {
      return NextResponse.json(
        { message: 'Já existe uma variação com este código veiling' },
        { status: 400 }
      )
    }

    const novaVariacao = await prisma.variacao.create({
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

    return NextResponse.json(novaVariacao, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar variação:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
