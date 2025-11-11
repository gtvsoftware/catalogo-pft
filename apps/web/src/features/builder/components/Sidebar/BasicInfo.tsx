import { Icon } from '@terraviva/ui/icon'
import { Input } from '@terraviva/ui/input'
import { Label } from '@terraviva/ui/label'
import { useEffect, useState } from 'react'

import Avatar from '@/components/Avatar'

import { useCatalogBuilder } from '../../providers/CatalogBuilderContext'

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

export function BasicInfo() {
  const { formValues, setIsMounted } = useCatalogBuilder()

  const catalogId = formValues.watch('id')
  const catalogSlug = formValues.watch('slug')
  const catalogName = formValues.watch('title')
  const seller = formValues.watch('seller')

  const [isCheckingSlug, setIsCheckingSlug] = useState(false)
  const [slugError, setSlugError] = useState<string | null>(null)
  const [initialSlug, setInitialSlug] = useState<string | undefined>()
  const [localCatalogName, setLocalCatalogName] = useState(catalogName || '')

  const sellerName = seller?.name || 'Vendedor'
  const sellerPicture = seller?.picture

  useEffect(() => {
    setIsMounted(true)
    setInitialSlug(catalogSlug)
  }, [catalogSlug])

  useEffect(() => {
    if (catalogName !== undefined) setLocalCatalogName(catalogName)
  }, [catalogName])

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

  return (
    <div className="space-y-4 pt-2 pb-4 px-4">
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

              if (baseSlug !== catalogSlug && baseSlug !== initialSlug) {
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
        <Label className="text-sm">Vendedor</Label>
        <div className="flex items-center gap-3 mt-1.5 p-3 bg-gray-50 rounded-md border">
          <Avatar
            image={
              sellerPicture
                ? `https://megtv2.blob.core.windows.net/public/avatars/${sellerPicture}`
                : undefined
            }
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {sellerName}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
