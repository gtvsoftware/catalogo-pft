import { Button } from '@terraviva/ui/button'
import { Icon } from '@terraviva/ui/icon'
import { Input } from '@terraviva/ui/input'
import { Label } from '@terraviva/ui/label'
import { toast } from '@terraviva/ui/sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@terraviva/ui/tabs'
import { useEffect, useState } from 'react'

import { useCatalogBuilder } from '../providers/CatalogBuilderContext'

const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove duplicate hyphens
}

export function Sidebar() {
  const {
    sidebarOpen,
    setSidebarOpen,
    viewMode,
    activeTab,
    setActiveTab,
    updateCatalogInfo,
    catalogInfo,
    formatDateRange,
    formValues
  } = useCatalogBuilder()

  const catalogId = formValues.watch('id')
  const catalogSlug = catalogInfo.slug

  const [mounted, setMounted] = useState(false)

  // Local state for inputs
  const [localCatalogName, setLocalCatalogName] = useState(
    catalogInfo.catalogName
  )
  const [localSellerName, setLocalSellerName] = useState(catalogInfo.sellerName)
  const [localPhoneContact, setLocalPhoneContact] = useState(
    catalogInfo.phoneContact
  )
  const [localAvailabilityStart, setLocalAvailabilityStart] = useState(
    catalogInfo.availabilityStart
  )
  const [localAvailabilityEnd, setLocalAvailabilityEnd] = useState(
    catalogInfo.availabilityEnd
  )
  const [isCheckingSlug, setIsCheckingSlug] = useState(false)
  const [slugError, setSlugError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Sync local state when catalogInfo changes externally
  useEffect(() => {
    setLocalCatalogName(catalogInfo.catalogName)
  }, [catalogInfo.catalogName])

  useEffect(() => {
    setLocalSellerName(catalogInfo.sellerName)
  }, [catalogInfo.sellerName])

  useEffect(() => {
    setLocalPhoneContact(catalogInfo.phoneContact)
  }, [catalogInfo.phoneContact])

  useEffect(() => {
    setLocalAvailabilityStart(catalogInfo.availabilityStart)
  }, [catalogInfo.availabilityStart])

  useEffect(() => {
    setLocalAvailabilityEnd(catalogInfo.availabilityEnd)
  }, [catalogInfo.availabilityEnd])

  // Check slug availability
  const checkSlugAvailability = async (slug: string) => {
    if (!slug) return true

    setIsCheckingSlug(true)
    setSlugError(null)

    try {
      const response = await fetch(
        `/api/catalogos/check-slug?slug=${encodeURIComponent(slug)}&excludeId=${catalogId}`
      )
      const data = await response.json()

      if (!data.available) {
        setSlugError('Este slug já está em uso. Escolha outro nome para o catálogo.')
        return false
      }

      return true
    } catch (error) {
      console.error('Error checking slug:', error)
      return true // Allow on error to not block user
    } finally {
      setIsCheckingSlug(false)
    }
  }

  // Auto-generate slug from catalog name with availability check
  useEffect(() => {
    if (catalogInfo.catalogName) {
      const autoSlug = generateSlug(catalogInfo.catalogName)
      if (autoSlug !== catalogInfo.slug) {
        checkSlugAvailability(autoSlug).then(isAvailable => {
          if (isAvailable) {
            setSlugError(null) // Clear error when slug is available
            updateCatalogInfo('slug', autoSlug)
          }
        })
      } else {
        // If slug hasn't changed, clear any existing error
        setSlugError(null)
      }
    }
  }, [catalogInfo.catalogName])

  const baseUrl =
    mounted && typeof window !== 'undefined' ? window.location.origin : ''
  const linkById = baseUrl ? `${baseUrl}/catalogos/${catalogId}` : ''
  const linkBySlug =
    catalogSlug && baseUrl ? `${baseUrl}/catalogos/${catalogSlug}` : ''

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
      {/* Mobile Close Button */}
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
                  onBlur={() => {
                    if (localCatalogName !== catalogInfo.catalogName) {
                      updateCatalogInfo('catalogName', localCatalogName)
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
                    value={catalogInfo.slug}
                    placeholder="Gerado automaticamente"
                    className={`text-sm font-mono bg-gray-50 ${slugError ? 'border-red-500' : ''}`}
                  />
                  {isCheckingSlug && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Icon icon="spinner" className="w-4 h-4 animate-spin text-gray-400" />
                    </div>
                  )}
                </div>
                {slugError ? (
                  <p className="text-xs text-red-600 mt-1">
                    {slugError}
                  </p>
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
                    if (localSellerName !== catalogInfo.sellerName) {
                      updateCatalogInfo('sellerName', localSellerName)
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
                  id="phoneContact"
                  type="tel"
                  value={localPhoneContact}
                  onChange={e => setLocalPhoneContact(e.target.value)}
                  onBlur={() => {
                    if (localPhoneContact !== catalogInfo.phoneContact) {
                      updateCatalogInfo('phoneContact', localPhoneContact)
                    }
                  }}
                  placeholder="ex: +55 (11) 98765-4321"
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
                    if (
                      localAvailabilityStart !== catalogInfo.availabilityStart
                    ) {
                      updateCatalogInfo(
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
                    if (localAvailabilityEnd !== catalogInfo.availabilityEnd) {
                      updateCatalogInfo('availabilityEnd', localAvailabilityEnd)
                    }
                  }}
                  className="text-sm"
                />
              </div>

              {(catalogInfo.availabilityStart ||
                catalogInfo.availabilityEnd) && (
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
