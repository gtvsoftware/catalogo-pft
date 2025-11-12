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
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isHolding, setIsHolding] = useState(false)

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

  // Story progress effect
  useEffect(() => {
    if (selectedImages.length === 0 || isPaused || isHolding) return

    const duration = 5000
    const interval = 50
    const increment = (interval / duration) * 100

    const timer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + increment
        if (newProgress >= 100) {
          if (currentImageIndex < selectedImages.length - 1) {
            setCurrentImageIndex(prev => prev + 1)
            return 0
          } else {
            setSelectedImages([])
            setCurrentImageIndex(0)
            return 0
          }
        }
        return newProgress
      })
    }, interval)

    return () => clearInterval(timer)
  }, [selectedImages, currentImageIndex, isPaused, isHolding])

  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1)
      setProgress(0)
    }
  }

  const handleNextImage = () => {
    if (currentImageIndex < selectedImages.length - 1) {
      setCurrentImageIndex(prev => prev + 1)
      setProgress(0)
    } else {
      setSelectedImages([])
      setCurrentImageIndex(0)
      setProgress(0)
    }
  }

  const handleCloseModal = () => {
    setSelectedImages([])
    setCurrentImageIndex(0)
    setProgress(0)
    setIsPaused(false)
  }

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
    link.download = `produto-imagem-${currentImageIndex + 1}.jpg`
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
                          onClick={() => {
                            if (item.image && !imageErrors[item.id]) {
                              setSelectedImages([item.image])
                              setCurrentImageIndex(0)
                              setProgress(0)
                            }
                          }}
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

      {selectedImages.length > 0 && (
        <div
          className="fixed inset-0 bg-black z-[100] flex items-center justify-center"
          onClick={handleCloseModal}
        >
          <div className="absolute top-0 left-0 right-0 flex gap-1 p-2 z-10">
            {selectedImages.map((_, index) => (
              <div
                key={index}
                className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden"
              >
                <div
                  className="h-full bg-white transition-all duration-100 ease-linear"
                  style={{
                    width:
                      index < currentImageIndex
                        ? '100%'
                        : index === currentImageIndex
                          ? `${progress}%`
                          : '0%'
                  }}
                />
              </div>
            ))}
          </div>

          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <IconButton
              icon={isPaused ? 'play' : 'pause'}
              onClick={e => {
                e.stopPropagation()
                setIsPaused(!isPaused)
              }}
              className="bg-black/50 hover:bg-black/70 text-white rounded-full p-3 backdrop-blur-sm transition-colors"
              title={isPaused ? 'Retomar' : 'Pausar'}
            />
            <IconButton
              icon="xmark"
              onClick={handleCloseModal}
              className="bg-black/50 hover:bg-black/70 text-white rounded-full p-3 backdrop-blur-sm transition-colors"
              title="Fechar"
            />
          </div>

          <div
            className="relative w-full h-full max-w-lg flex items-center justify-center"
            onClick={e => {
              e.stopPropagation()
              setIsPaused(!isPaused)
            }}
          >
            <div
              className="absolute left-0 top-0 bottom-0 w-1/3 cursor-pointer z-10"
              onClick={e => {
                e.stopPropagation()
                handlePrevImage()
              }}
            />
            <div
              className="absolute right-0 top-0 bottom-0 w-1/3 cursor-pointer z-10"
              onClick={e => {
                e.stopPropagation()
                handleNextImage()
              }}
            />

            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={selectedImages[currentImageIndex]}
                alt="Product image"
                width={1200}
                height={1200}
                className="object-contain w-full h-full max-h-screen"
              />
            </div>

            {currentImageIndex > 0 && (
              <button
                onClick={e => {
                  e.stopPropagation()
                  handlePrevImage()
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 backdrop-blur-sm transition-colors hidden md:block z-20"
                title="Anterior"
              >
                <Icon icon="chevron-left" className="text-xl" />
              </button>
            )}
            {currentImageIndex < selectedImages.length - 1 && (
              <button
                onClick={e => {
                  e.stopPropagation()
                  handleNextImage()
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 backdrop-blur-sm transition-colors hidden md:block z-20"
                title="Próximo"
              >
                <Icon icon="chevron-right" className="text-xl" />
              </button>
            )}
          </div>

          <div className="absolute bottom-6 right-6 flex gap-3 z-10">
            <IconButton
              icon="arrow-down"
              onClick={e => {
                e.stopPropagation()
                handleDownloadImage(selectedImages[currentImageIndex])
              }}
              className="bg-black/50 hover:bg-black/70 text-white rounded-full p-3 backdrop-blur-sm transition-colors"
              title="Baixar imagem"
            />
            {selectedImages.length > 1 && (
              <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-2 rounded-full text-xs font-medium">
                {currentImageIndex + 1}/{selectedImages.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
