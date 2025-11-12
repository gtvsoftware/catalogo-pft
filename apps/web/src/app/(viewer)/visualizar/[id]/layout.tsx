import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

async function getCatalogo(id: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/catalogos/${id}`, {
      cache: 'no-store'
    })

    if (!res.ok) return null

    return await res.json()
  } catch (error) {
    console.error('Error fetching catalogo:', error)
    return null
  }
}

export async function generateMetadata({
  params
}: PageProps): Promise<Metadata> {
  const { id } = await params

  const catalogo = await getCatalogo(id)

  if (!catalogo) {
    return {
      title: 'Catálogo'
    }
  }

  return {
    title: catalogo.title || 'Catálogo',
    description:
      catalogo.cover?.subtitle || `Confira os produtos em ${catalogo.title}`
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
