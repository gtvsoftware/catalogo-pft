'use client'

import { Button, IconButton, LoadingSpinner } from '@terraviva/ui/button'
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

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
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
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

  const handleDownloadImage = (imageUrl: string) => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = 'produto-imagem.jpg'
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
                className="relative aspect-[32/9] overflow-hidden"
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

            {catalogo.availabilityEnd && (
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
            )}

            <div className="flex flex-col px-4 sm:px-6 md:px-8 py-8 gap-8">
              {catalogo.sections.map((section, _index) => (
                <div
                  key={section.id}
                  className="w-full flex flex-col gap-0 bg-white"
                >
                  <h2 className="text-xl font-medium">
                    {section.title || 'Seção'}
                  </h2>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-8">
                    {section.items.map(item => (
                      <div
                        key={item.id}
                        className={cn(
                          'group flex flex-col w-full rounded-xl bg-white overflow-hidden hover:scale-[1.02] transition-transform'
                        )}
                      >
                        <div
                          className="relative w-full aspect-[3/4] bg-white cursor-pointer overflow-hidden"
                          onClick={() =>
                            item.image &&
                            !imageErrors[item.id] &&
                            setSelectedImage(item.image)
                          }
                        >
                          {item.image && !imageErrors[item.id] ? (
                            <Image
                              src={item.image}
                              alt={item.name || 'Produto'}
                              fill
                              className="object-cover"
                              onError={() =>
                                setImageErrors(prev => ({
                                  ...prev,
                                  [item.id]: true
                                }))
                              }
                            />
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 p-4">
                              <Icon
                                icon="image-slash"
                                variant="light"
                                className="text-gray-400 text-3xl"
                              />
                              <span className="text-sm font-medium text-gray-500 mt-2">
                                {imageErrors[item.id] && 'Sem imagem'}
                              </span>
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

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full flex items-center justify-center"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative w-full h-full ">
              <Image
                src={selectedImage}
                alt="Product image"
                width={1200}
                height={1200}
                className="object-contain w-full h-full max-h-[80vh]"
              />
            </div>
            <div className="absolute bottom-0 mb-4 mx-auto">
              <Button
                leftIcon="arrow-down"
                onClick={() => handleDownloadImage(selectedImage)}
                title="Baixar imagem"
              >
                Baixar Imagem
              </Button>
            </div>
            <div className="absolute top-4 right-4 flex gap-2">
              <IconButton
                icon="xmark"
                onClick={() => setSelectedImage(null)}
                className="bg-white hover:bg-gray-100 text-gray-800 rounded-full p-3 shadow-lg transition-colors"
                title="Fechar"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
