import { prisma } from '@terraviva/db-catalogo-pft'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const q = url.searchParams.get('q') || undefined

    const filter: any = {}
    if (q) {
      filter.name = { $regex: q, $options: 'i' }
    }

    const result: any = await prisma.$runCommandRaw({
      find: 'sellers',
      filter,
      sort: { name: 1 }
    })

    const sellers = result.cursor?.firstBatch || []

    const normalized = sellers.map((s: any) => ({
      id: s._id,
      name: s.name || null,
      picture: s.picture || null
    }))

    return NextResponse.json(normalized)
  } catch (err) {
    console.error('Erro ao listar sellers:', err)
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}
