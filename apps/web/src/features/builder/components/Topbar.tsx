import { Button, IconButton } from '@terraviva/ui/button'
import { Separator } from '@terraviva/ui/separator'

import { useCatalogBuilder } from '../providers/CatalogBuilderContext'

export function CatalogBuilderTopBar() {
  const { sidebarOpen, setSidebarOpen, viewMode, setViewMode } =
    useCatalogBuilder()

  return (
    <div className="bg-white border-b px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <IconButton
          icon={sidebarOpen ? 'x' : 'bars'}
          variant="ghost"
          size="sm"
          className="lg:hidden p-2"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        />
        <div className="min-w-0 flex-1">
          <h1 className="text-sm sm:text-base font-bold text-gray-800 truncate">
            Criador de catálogos
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <div className="hidden sm:flex items-center gap-1">
          <Button
            leftIcon="cog"
            variant={viewMode === 'edit' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('edit')}
          >
            <span className="hidden sm:inline">Editar</span>
          </Button>
          <Button
            leftIcon="eye"
            variant={viewMode === 'preview' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('preview')}
          >
            <span className="hidden sm:inline">Pré-visualizar</span>
          </Button>
        </div>
        <Separator orientation="vertical" className="min-h-6 hidden sm:flex" />
        <Button
          leftIcon="floppy-disk"
          variant="default"
          size="sm"
          className="flex-shrink-0"
        >
          <span>Salvar</span>
        </Button>
      </div>
    </div>
  )
}
