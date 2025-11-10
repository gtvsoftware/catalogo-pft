import { Button } from '@terraviva/ui/button'
import { Icon } from '@terraviva/ui/icon'
import { Input } from '@terraviva/ui/input'
import { Label } from '@terraviva/ui/label'
import { toast } from '@terraviva/ui/sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@terraviva/ui/tabs'
import { useEffect, useRef, useState } from 'react'
import { IMask } from 'react-imask'

import { useCatalogBuilder } from '../providers/CatalogBuilderContext'

const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function Sidebar() {
  const {
    sidebarOpen,
    setSidebarOpen,
    viewMode,
    activeTab,
    setActiveTab,
    formatDateRange,
    formValues
  } = useCatalogBuilder()

  const catalogId = formValues.watch('id')
  const catalogSlug = formValues.watch('slug')
  const catalogName = formValues.watch('title')
  const sellerName = formValues.watch('sellerName')
  const phoneContact = formValues.watch('phoneContact')
  const availabilityStart = formValues.watch('availabilityStart')
  const availabilityEnd = formValues.watch('availabilityEnd')

  const [mounted, setMounted] = useState(false)
  const [isCheckingSlug, setIsCheckingSlug] = useState(false)
  const [slugError, setSlugError] = useState<string | null>(null)
  const [initialSlug, setInitialSlug] = useState<string | undefined>()

  const [localCatalogName, setLocalCatalogName] = useState(catalogName || '')
  const [localSellerName, setLocalSellerName] = useState(sellerName || '')
  const [localPhoneContact, setLocalPhoneContact] = useState(phoneContact || '')
  const [localAvailabilityStart, setLocalAvailabilityStart] = useState(
    availabilityStart || ''
  )
  const [localAvailabilityEnd, setLocalAvailabilityEnd] = useState(
    availabilityEnd || ''
  )

  const phoneInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)

    setInitialSlug(catalogSlug)
  }, [])

  useEffect(() => {
    if (catalogName !== undefined) setLocalCatalogName(catalogName)
  }, [catalogName])

  useEffect(() => {
    if (sellerName !== undefined) setLocalSellerName(sellerName)
  }, [sellerName])

  useEffect(() => {
    if (phoneContact !== undefined) setLocalPhoneContact(phoneContact)
  }, [phoneContact])

  useEffect(() => {
    if (availabilityStart !== undefined)
      setLocalAvailabilityStart(availabilityStart)
  }, [availabilityStart])

  useEffect(() => {
    if (availabilityEnd !== undefined) setLocalAvailabilityEnd(availabilityEnd)
  }, [availabilityEnd])

  useEffect(() => {
    if (phoneInputRef.current) {
      const maskInstance = IMask(phoneInputRef.current, {
        mask: [
          {
            mask: '(00)0000-0000',
            lazy: false
          },
          {
            mask: '(00)00000-0000',
            lazy: false
          }
        ],
        dispatch: function (appended, dynamicMasked) {
          const number = (dynamicMasked.value + appended).replace(/\D/g, '')

          return number.length > 10
            ? dynamicMasked.compiledMasks[1]
            : dynamicMasked.compiledMasks[0]
        }
      })

      return () => {
        maskInstance.destroy()
      }
    }
  }, [])

  const getUniqueSlug = async (baseSlug: string): Promise<string> => {
    if (!baseSlug) return ''

    let slug = baseSlug
    let counter = 2
    let isAvailable = false

    setIsCheckingSlug(true)
    setSlugError(null)

    try {
      while (!isAvailable) {
        const response = await fetch(
          `/api/catalogos/check-slug?slug=${encodeURIComponent(slug)}&excludeId=${catalogId}`
        )
        const data = await response.json()

        if (data.available) {
          isAvailable = true
          setSlugError(null)
        } else {
          slug = `${baseSlug}-${counter}`
          counter++
        }
      }

      return slug
    } catch (error) {
      console.error('Error checking slug:', error)
      return baseSlug
    } finally {
      setIsCheckingSlug(false)
    }
  }

  const baseUrl =
    mounted && typeof window !== 'undefined' ? window.location.origin : ''
  const linkById = baseUrl ? `${baseUrl}/visualizar/${catalogId}` : ''
  const linkBySlug =
    catalogSlug && baseUrl ? `${baseUrl}/visualizar/${catalogSlug}` : ''

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copiado!`)
  }

  return (
    <div
      className={`
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
          lg:translate-x-0 transition-transform duration-300 ease-in-out
          fixed lg:static inset-y-0 right-0 z-40
          w-full sm:w-96 bg-white border-l flex flex-col
          ${viewMode === 'preview' ? 'hidden lg:hidden' : ''}
        `}
    >
      <div className="lg:hidden flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold">Editor</h2>
        <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
          <Icon icon="x" className="w-5 h-5" />
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex overflow-hidden"
      >
        <div className="ml-3 mr-5">
          <TabsList className="grid-cols-2 w-full hidden">
            <TabsTrigger
              leftIcon="cog"
              value="info"
              className="flex items-center gap-1 text-xs sm:text-sm"
            >
              <span>Informações</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="info"
          className="flex-1 overflow-auto px-3 min-h-full mb-24"
        >
          <div className="flex flex-col space-y-6 pb-24 px-2">
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 mb-4">
                <Icon icon="file" className="w-4 h-4 text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-700">
                  Informações Básicas
                </h3>
              </div>

              <div>
                <Label htmlFor="catalogName" className="text-sm">
                  Nome do Catálogo *
                </Label>
                <Input
                  id="catalogName"
                  value={localCatalogName}
                  onChange={e => setLocalCatalogName(e.target.value)}
                  onBlur={async () => {
                    if (localCatalogName !== catalogName) {
                      const baseSlug = generateSlug(localCatalogName)

                      if (
                        baseSlug !== catalogSlug &&
                        baseSlug !== initialSlug
                      ) {
                        const uniqueSlug = await getUniqueSlug(baseSlug)

                        formValues.setValue('title', localCatalogName)
                        formValues.setValue('slug', uniqueSlug, {
                          shouldDirty: false
                        })
                      } else {
                        formValues.setValue('title', localCatalogName)
                      }
                    }
                  }}
                  placeholder="ex: Coleção Primavera 2025"
                  className="text-sm"
                />
              </div>

              <div>
                <Label htmlFor="slug" className="text-sm">
                  Slug (URL personalizada)
                </Label>
                <div className="relative">
                  <Input
                    id="slug"
                    readOnly
                    value={catalogSlug || ''}
                    placeholder="Gerado automaticamente"
                    className={`text-sm font-mono bg-gray-50 ${slugError ? 'border-red-500' : ''}`}
                  />
                  {isCheckingSlug && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Icon
                        icon="spinner"
                        className="w-4 h-4 animate-spin text-gray-400"
                      />
                    </div>
                  )}
                </div>
                {slugError ? (
                  <p className="text-xs text-red-600 mt-1">{slugError}</p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">
                    Gerado automaticamente a partir do nome do catálogo
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="sellerName" className="text-sm">
                  Nome do Vendedor *
                </Label>
                <Input
                  id="sellerName"
                  value={localSellerName}
                  onChange={e => setLocalSellerName(e.target.value)}
                  onBlur={() => {
                    if (localSellerName !== sellerName) {
                      formValues.setValue('sellerName', localSellerName)
                    }
                  }}
                  placeholder="ex: João Silva"
                  className="text-sm"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center gap-2 mb-4">
                <Icon icon="link" className="w-4 h-4 text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-700">
                  Links de Compartilhamento
                </h3>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Link por ID</Label>
                  <div className="flex items-center gap-2 mt-1.5 px-2 bg-gray-50 rounded-md border">
                    <code className="flex-1 text-xs font-mono text-gray-700 truncate">
                      {linkById}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(linkById, 'Link por ID')}
                      className="flex-shrink-0"
                    >
                      <Icon icon="copy" className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {catalogSlug && (
                  <div>
                    <Label className="text-sm font-medium">Link por Slug</Label>
                    <div className="flex items-center gap-2 mt-1.5 px-2 bg-gray-50 rounded-md border">
                      <code className="flex-1 text-xs font-mono text-gray-700 truncate">
                        {linkBySlug}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          copyToClipboard(linkBySlug, 'Link por Slug')
                        }
                        className="flex-shrink-0"
                      >
                        <Icon icon="copy" className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-500">
                Compartilhe estes links com seus clientes
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center gap-2 mb-4">
                <Icon icon="phone" className="w-4 h-4 text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-700">
                  Informações de Contato
                </h3>
              </div>

              <div>
                <Label htmlFor="phoneContact" className="text-sm">
                  Telefone de Contato *
                </Label>
                <Input
                  ref={phoneInputRef}
                  id="phoneContact"
                  type="tel"
                  value={localPhoneContact}
                  onChange={e => setLocalPhoneContact(e.target.value)}
                  onBlur={() => {
                    if (localPhoneContact !== phoneContact) {
                      formValues.setValue('phoneContact', localPhoneContact)
                    }
                  }}
                  placeholder="(00)00000-0000"
                  className="text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Clientes usarão este número para fazer pedidos
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center gap-2 mb-4">
                <Icon icon="calendar" className="w-4 h-4 text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-700">
                  Período de Disponibilidade
                </h3>
              </div>

              <div>
                <Label htmlFor="availabilityStart" className="text-sm">
                  Data de Início *
                </Label>
                <Input
                  id="availabilityStart"
                  type="date"
                  value={localAvailabilityStart}
                  onChange={e => setLocalAvailabilityStart(e.target.value)}
                  onBlur={() => {
                    if (localAvailabilityStart !== availabilityStart) {
                      formValues.setValue(
                        'availabilityStart',
                        localAvailabilityStart
                      )
                    }
                  }}
                  className="text-sm"
                />
              </div>

              <div>
                <Label htmlFor="availabilityEnd" className="text-sm">
                  Data de Término *
                </Label>
                <Input
                  id="availabilityEnd"
                  type="date"
                  value={localAvailabilityEnd}
                  onChange={e => setLocalAvailabilityEnd(e.target.value)}
                  onBlur={() => {
                    if (localAvailabilityEnd !== availabilityEnd) {
                      formValues.setValue(
                        'availabilityEnd',
                        localAvailabilityEnd
                      )
                    }
                  }}
                  className="text-sm"
                />
              </div>

              {(availabilityStart || availabilityEnd) && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800 font-medium">
                    Período Disponível
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {formatDateRange()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
