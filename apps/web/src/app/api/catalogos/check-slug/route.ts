import { prisma } from '@terraviva/db-catalogo-pft'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const excludeId = searchParams.get('excludeId') // Current catalog ID to exclude from check

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug is required' },
        { status: 400 }
      )
    }

    const existing = await prisma.catalogo.findUnique({
      where: { slug },
      select: { id: true }
    })

    // If exists and it's not the current catalog, it's taken
    const isAvailable = !existing || (excludeId && existing.id === excludeId)

    return NextResponse.json({ available: isAvailable })
  } catch (error) {
    console.error('Error checking slug:', error)
    return NextResponse.json(
      { error: 'Failed to check slug availability' },
      { status: 500 }
    )
  }
}
