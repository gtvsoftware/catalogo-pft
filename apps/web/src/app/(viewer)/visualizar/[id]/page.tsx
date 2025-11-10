'use client'

import { LoadingSpinner } from '@terraviva/ui/button'
import { cn } from '@terraviva/ui/cn'
import { Icon } from '@terraviva/ui/icon'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { LogoTerraViva } from '@/features/builder/components/LogoTerraViva'

export default function Page(): React.ReactElement {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [catalogo, setCatalogo] = useState<catalogoFormType | null>(null)

  useEffect(() => {
    if (id) {
      const fetchCatalogo = async () => {
        const res = await fetch(`/api/catalogos/${id}`)
        if (res.ok) {
          const catalogo = await res.json()
          setCatalogo(catalogo)
          setLoading(false)
        }
      }
      fetchCatalogo()
    } else {
      setLoading(false)
    }
  }, [id])

  const getCoverStyle = (): React.CSSProperties => {
    if (!catalogo?.cover) return {}

    if (
      catalogo.cover.backgroundType === 'image' &&
      catalogo.cover.backgroundImage
    ) {
      return {
        backgroundImage: `url(${catalogo.cover.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    }
    return {
      backgroundColor: catalogo.cover.backgroundColor
    }
  }

  const getWhatsAppLink = () => {
    if (!catalogo?.phoneContact) return null

    const phone = catalogo.phoneContact.replace(/\D/g, '')
    const title = catalogo.title || 'catálogo'
    const message = `Olá, vim pelo catálogo ${title} e tenho interesse!`

    return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`
  }

  return loading ? (
    <div className="w-screen h-screen flex items-center justify-center">
      <LoadingSpinner />
    </div>
  ) : (
    <div className="w-screen min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto bg-white shadow-sm">
        {catalogo?.cover?.showLogo && <LogoTerraViva />}
        {catalogo && (
          <>
            {catalogo.cover?.enabled && (
              <div
                className="relative h-64 sm:h-72 md:h-80 overflow-hidden"
                style={getCoverStyle()}
              >
                <div
                  className="absolute inset-0 bg-black"
                  style={{
                    opacity: (catalogo.cover.overlayOpacity ?? 30) / 100
                  }}
                />
                <div
                  className={`absolute inset-0 flex flex-col ${
                    catalogo.cover.alignment === 'left'
                      ? 'items-start justify-end text-left pb-8 pl-8'
                      : 'items-center justify-center text-center'
                  } p-4 sm:p-6 md:p-8`}
                >
                  {catalogo.cover.showTitle && catalogo.cover.title && (
                    <h1 className="text-xl sm:text-2xl md:text-4xl font-bold mb-2 sm:mb-4 text-white">
                      {catalogo.cover.title}
                    </h1>
                  )}
                  {catalogo.cover.showSubtitle && catalogo.cover.subtitle && (
                    <p className="text-base sm:text-base md:text-lg text-white">
                      {catalogo.cover.subtitle}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-1 bg-gray-100 px-8 py-4">
              {catalogo?.availabilityStart && catalogo?.availabilityEnd ? (
                <div className="text-xs text-gray-400">
                  <p>
                    <span>Período de validade:</span>{' '}
                    {new Date(catalogo.availabilityStart).toLocaleDateString(
                      'pt-BR',
                      {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      }
                    )}
                    {' até '}
                    {new Date(catalogo.availabilityEnd).toLocaleDateString(
                      'pt-BR',
                      {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      }
                    )}
                  </p>
                </div>
              ) : catalogo?.availabilityEnd ? (
                <div className="text-xs text-gray-400">
                  <p>
                    <span className="font-medium">Disponível até:</span>{' '}
                    {new Date(catalogo.availabilityEnd).toLocaleDateString(
                      'pt-BR',
                      {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      }
                    )}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="flex flex-col px-4 sm:px-6 md:px-8 py-8 gap-8">
              {catalogo.sections.map((section, _index) => (
                <div
                  key={section.id}
                  className="w-full flex flex-col gap-4 bg-white"
                >
                  <h2 className="text-xl font-medium">
                    {section.title || 'Seção'}
                  </h2>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
                    {section.items.map(item => (
                      <div
                        key={item.id}
                        className={cn(
                          'group flex flex-col w-full cursor-pointer rounded-xl bg-white overflow-hidden hover:scale-[1.02]  transition-transform p-6'
                        )}
                      >
                        <div className="relative w-full aspect-square bg-gray-50">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                              <Icon
                                icon="image-stack"
                                family="duotone"
                                className="text-gray-400 text-4xl"
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col flex-1 justify-between gap-4 p-2">
                          <div className="space-y-1">
                            <p className="font-medium line-clamp-2">
                              {item.name}
                            </p>
                            {item.description && (
                              <p className="text-gray-500 text-sm line-clamp-2">
                                {item.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {item.price && item.discountPrice ? (
                              <>
                                <p className="font-medium text-primary-500">{`R$${item.discountPrice}`}</p>
                                <p className="text-gray-500 text-sm line-through">{`R$${item.price}`}</p>
                              </>
                            ) : (
                              (item.price || item.discountPrice) && (
                                <p className="font-medium text-primary-500">{`R$${item.price || item.discountPrice}`}</p>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {catalogo?.phoneContact && (
        <a
          href={getWhatsAppLink() || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg px-6 py-4 flex items-center gap-3 transition-all hover:scale-105 z-50 font-semibold"
          title="Fale conosco no WhatsApp"
        >
          <Icon icon="whatsapp" variant="brands" className="text-2xl" />
          <span>Comprar Agora</span>
        </a>
      )}
    </div>
  )
}
