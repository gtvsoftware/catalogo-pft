import { Icon } from '@terraviva/ui/icon'

import { useCatalogBuilder } from '../providers/CatalogBuilderContext'

export function MobileBottomBar() {
  const { mobileTab, setMobileTab, viewMode } = useCatalogBuilder()

  if (viewMode === 'preview') {
    return null
  }

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg">
      <div className="flex items-center justify-around">
        <button
          type="button"
          onClick={() => setMobileTab('builder')}
          className={`
            flex-1 flex flex-col items-center justify-center gap-2 py-2 px-4
            transition-colors duration-200
            ${
              mobileTab === 'builder'
                ? 'text-primary-600 border-t-2 border-primary-500'
                : 'text-gray-600 hover:bg-gray-50'
            }
          `}
        >
          <Icon icon="layer-group" variant="solid" className="text-sm" />
          <span className="text-xs font-medium">Estrutura</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab('sidebar')}
          className={`
            flex-1 flex flex-col items-center justify-center gap-2 py-2 px-4
            transition-colors duration-200
            ${
              mobileTab === 'sidebar'
                ? 'text-primary-600 border-t-2 border-primary-500'
                : 'text-gray-600 hover:bg-gray-50'
            }
          `}
        >
          <Icon icon="circle-info" variant="solid" className="text-sm" />
          <span className="text-xs font-medium">Informações</span>
        </button>
      </div>
    </div>
  )
}
