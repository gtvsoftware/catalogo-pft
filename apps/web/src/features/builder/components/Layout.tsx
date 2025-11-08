import { useCatalogBuilder } from '../providers/CatalogBuilderContext'
import { MobileViewSwitch } from './MobileViewSwitch'
import { Sidebar } from './Sidebar'
import { CatalogBuilderTopBar } from './Topbar'

export function CatalogBuilderLayout({ children }: React.PropsWithChildren) {
  const {
    sidebarOpen,
    setSidebarOpen,
  } = useCatalogBuilder()

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      <CatalogBuilderTopBar />
      <MobileViewSwitch />

      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 overflow-auto bg-gray-100">
          <div className="p-3 sm:p-6 md:p-8">
            <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg min-h-full">
              <div className="flex flex-col">
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
      </div>
    </div>
  )
}
