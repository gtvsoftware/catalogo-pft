import { Icon } from '@terraviva/ui/icon'

import { useCatalogBuilder } from '../providers/CatalogBuilderContext'
import { LogoTerraViva } from './LogoTerraViva'
import { MobileViewSwitch } from './MobileViewSwitch'
import { Sidebar } from './Sidebar'
import { CatalogBuilderTopBar } from './Topbar'

export function CatalogBuilderLayout({ children }: React.PropsWithChildren) {
  const { sidebarOpen, setSidebarOpen, formValues, viewMode } =
    useCatalogBuilder()

  const getWhatsAppLink = () => {
    const catalogData = formValues.getValues()
    if (!catalogData?.phoneContact) return null

    const phone = catalogData.phoneContact.replace(/\D/g, '')
    const title = catalogData.title || 'catálogo'
    const message = `Olá, vim pelo catálogo ${title} e tenho interesse!`

    return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`
  }

  const shouldShowWhatsApp = () => {
    const catalogData = formValues.getValues()
    return viewMode === 'preview' && catalogData?.phoneContact
  }

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      <CatalogBuilderTopBar />
      <MobileViewSwitch />

      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 overflow-auto bg-gray-100">
          <div className="p-3 sm:p-6 md:p-8">
            <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg min-h-full">
              <div className="flex flex-col">
                {formValues.getValues().cover?.showLogo && <LogoTerraViva />}
                {children}
              </div>
            </div>
          </div>
        </div>
        <Sidebar />
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {shouldShowWhatsApp() && (
          <a
            href={getWhatsAppLink() || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg px-6 py-4 flex items-center gap-3 transition-all hover:scale-105 z-50 font-semibold"
            title="Fale conosco no WhatsApp"
          >
            <Icon
              icon="whatsapp"
              variant="brands"
              className="text-2xl fa-brand"
            />
            <span>Comprar Agora</span>
          </a>
        )}
      </div>
    </div>
  )
}
