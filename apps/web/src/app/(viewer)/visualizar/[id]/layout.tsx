import type { Metadata } from 'next'
import Image from 'next/image'

import LogoTerraViva from '@/assets/logo_terraviva.webp'

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

export default async function Layout({
  params,
  children
}: React.PropsWithChildren<PageProps>) {
  const { id } = await params

  const catalogo = await getCatalogo(id)

  if (!isAvailable(catalogo)) {
    const getWhatsAppLink = () => {
      if (!catalogo?.phoneContact) return null

      const phone = catalogo.phoneContact.replace(/\D/g, '')
      const title = catalogo.title || 'catálogo'
      const message = `Olá, vim pelo catálogo ${title} e gostaria de mais informações.`

      return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`
    }

    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
        <Image
          src={LogoTerraViva}
          width={220}
          className="mb-6"
          alt="Logo Terra Viva"
        />
        <h1 className="text-2xl font-bold mb-4">Catálogo Indisponível</h1>
        <p className="mb-2">Este catálogo não está disponível no momento.</p>
        <p className="mb-6">
          Por favor, entre em contato com o vendedor para mais informações.
        </p>
        {catalogo?.phoneContact && (
          <a
            href={getWhatsAppLink() || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg px-6 py-3 flex items-center gap-3 transition-all hover:scale-105 font-semibold"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            <span>Falar com {catalogo.seller.name}</span>
          </a>
        )}
      </div>
    )
  }

  return <>{children}</>
}

const isAvailable = (catalogo: any) => {
  if (!catalogo) return true

  // Get current date in UTC-3 (America/Sao_Paulo) as YYYY-MM-DD string
  const now = new Date()
  const todayStr = now.toLocaleDateString('en-CA', {
    timeZone: 'America/Sao_Paulo'
  }) // Returns "2025-11-13"

  if (catalogo.availabilityStart) {
    // Compare date strings directly (simpler and more reliable)
    if (todayStr < catalogo.availabilityStart) return false
  }

  if (catalogo.availabilityEnd) {
    if (todayStr > catalogo.availabilityEnd) return false
  }

  return true
}
