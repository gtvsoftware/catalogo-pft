'use client'

import { LoadingSpinner } from '@terraviva/ui/button'
import { cn } from '@terraviva/ui/cn'
import { Icon } from '@terraviva/ui/icon'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

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

  return loading ? (
    <div className="w-screen h-full">
      <LoadingSpinner />
    </div>
  ) : (
    <div className="w-screen flex justify-center">
      <div className="flex flex-col items-center gap-8 max-w-[800px] w-full">
        {!!catalogo && (
          <>
            <div className="flex flex-col items-center justify-center w-full aspect-[3/1] relative">
              {catalogo.banner ? (
                <Image
                  src={catalogo.banner}
                  alt="Banner"
                  fill
                  className="object-cover rounded-md"
                />
              ) : (
                <div className="w-full h-full bg-primary-500 absolute rounded-md" />
              )}
              <p
                className="z-10 text-6xl font-bold text-white"
                style={{ mixBlendMode: 'difference' }}
              >
                {catalogo.title}
              </p>
              {catalogo.caption && (
                <p
                  className="z-10 text-2xl font-bold text-white"
                  style={{ mixBlendMode: 'difference' }}
                >
                  {catalogo.caption}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-8 w-full">
              {catalogo.sections.map((section, _index) => (
                <div
                  key={section.id}
                  className="w-full flex flex-col gap-4 bg-white"
                >
                  <p className="text-xl font-medium outline-none">
                    {section.title}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {section.items.map(item => (
                      <div
                        key={item.id}
                        className={cn(
                          'group flex flex-col w-full cursor-pointer rounded-xl bg-white overflow-hidden  hover:scale-[1.02] hover:bg-gray-5'
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
                            <p className="font-medium  line-clamp-2">
                              {item.name}
                            </p>
                            {item.description && (
                              <p className="text-gray-500 text-sm">
                                {item.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ">
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
    </div>
  )
}
