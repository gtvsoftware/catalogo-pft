import { Button } from '@terraviva/ui/button'

import { useCatalogBuilder } from '../providers/CatalogBuilderContext'

export function MobileViewSwitch() {
  const { viewMode, setViewMode } = useCatalogBuilder()

  return (
    <div className="sm:hidden bg-white border-b px-3 py-2 flex gap-2">
      <Button
        leftIcon="cog"
        variant={viewMode === 'edit' ? 'default' : 'outline'}
        size="sm"
        className="flex-1"
        onClick={() => setViewMode('edit')}
      >
        Editar
      </Button>
      <Button
        leftIcon="eye"
        variant={viewMode === 'preview' ? 'default' : 'outline'}
        size="sm"
        className="flex-1"
        onClick={() => setViewMode('preview')}
      >
        Pré-visualizar
      </Button>
    </div>
  )
}
