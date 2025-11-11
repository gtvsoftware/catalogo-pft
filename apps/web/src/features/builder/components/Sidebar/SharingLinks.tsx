import { Button } from '@terraviva/ui/button'
import { Icon } from '@terraviva/ui/icon'
import { Label } from '@terraviva/ui/label'
import { toast } from '@terraviva/ui/sonner'

import { useCatalogBuilder } from '../../providers/CatalogBuilderContext'

export function SharingLinks() {
  const { formValues, isMounted } = useCatalogBuilder()

  const catalogId = formValues.watch('id')
  const catalogSlug = formValues.watch('slug')

  const baseUrl =
    isMounted && typeof window !== 'undefined' ? window.location.origin : ''
  const linkById = baseUrl ? `${baseUrl}/visualizar/${catalogId}` : ''
  const linkBySlug =
    catalogSlug && baseUrl ? `${baseUrl}/visualizar/${catalogSlug}` : ''

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copiado!`)
  }

  return (
    <div className="space-y-4 pt-2 pb-4 px-4">
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
                onClick={() => copyToClipboard(linkBySlug, 'Link por Slug')}
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
  )
}
