import { Button, IconButton } from '@terraviva/ui/button'
import { Icon } from '@terraviva/ui/icon'
import Link from 'next/link'

import { useCatalogBuilder } from '../providers/CatalogBuilderContext'

export function CatalogBuilderTopBar() {
  const { viewMode, setViewMode, isSaving, lastSaved, mobileTab } =
    useCatalogBuilder()

  const formatLastSaved = () => {
    if (!lastSaved) return ''
    const now = new Date()
    const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000)

    if (diff < 60) return 'agora mesmo'
    if (diff < 3600) return `há ${Math.floor(diff / 60)} min`
    return lastSaved.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  return (
    <>
      <div className="lg:hidden items-center sticky top-0 z-10 flex gap-2 px-4 py-1 border-b bg-white">
        <div className=" rounded-lg">
          <Icon
            icon="table-layout"
            variant="solid"
            className="text-primary-500"
          />
        </div>
        <div className="flex justify-between items-center w-full">
          <div>
            <h2 className="text-base font-semibold text-gray-800">
              Criador de catálogos
            </h2>
            <span className="text-gray-500 text-sm flex -mt-1">
              {mobileTab === 'builder' ? 'Estrutura' : 'Informações'}
            </span>
          </div>
          <Button variant="outline" size="sm">
            Sair do criador
          </Button>
        </div>
      </div>

      <div className="hidden bg-white border-b px-3 sm:px-4 py-2 sm:py-3 lg:flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <Link href="/">
            <IconButton
              icon="arrow-left"
              variant="ghost"
              size="sm"
              className="p-2"
              title="Voltar para lista"
            />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm sm:text-base font-bold text-gray-800 truncate">
              Criador de catálogos
            </h1>
            {(isSaving || lastSaved) && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                {isSaving ? (
                  <>
                    <Icon icon="spinner" className="w-3 h-3 animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Icon icon="check" className="w-3 h-3 text-green-600" />
                    <span>Salvo {formatLastSaved()}</span>
                  </>
                )}
              </div>
            )}
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
        </div>
      </div>
    </>
  )
}
