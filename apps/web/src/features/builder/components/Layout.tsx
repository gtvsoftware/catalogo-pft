import { Button } from '@terraviva/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@terraviva/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@terraviva/ui/dialog'
import { Icon } from '@terraviva/ui/icon'
import { Input } from '@terraviva/ui/input'
import { Label } from '@terraviva/ui/label'

import { useCatalogBuilder } from '../providers/CatalogBuilderContext'
import { MobileViewSwitch } from './MobileViewSwitch'
import { Sidebar } from './Sidebar'
import { CatalogBuilderTopBar } from './Topbar'

export function CatalogBuilderLayout({ children }: React.PropsWithChildren) {
  const {
    formValues,
    coverSettings,
    updateCoverSettings,
    catalogInfo,
    viewMode,
    sidebarOpen,
    setSidebarOpen,
    getCoverStyle,
    coverModalOpen,
    setCoverModalOpen,
    formatDateRange
  } = useCatalogBuilder()

  const colorOptions = [
    { name: 'Pink', value: '#ec4899' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Indigo', value: '#6366f1' }
  ]

  const { sections } = formValues.watch()

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      <CatalogBuilderTopBar />
      <MobileViewSwitch />

      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 overflow-auto bg-gray-100">
          <div className="p-3 sm:p-6 md:p-8">
            <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg min-h-full">
              {/* Catalog Cover */}
              {coverSettings.enabled ? (
                <div
                  className="relative h-64 sm:h-80 md:h-96 rounded-t-lg overflow-hidden group"
                  style={getCoverStyle()}
                >
                  <div className="absolute inset-0 bg-black bg-opacity-30" />
                  <div
                    className={`absolute inset-0 flex flex-col ${coverSettings.alignment === 'left' ? 'items-start justify-end text-left pb-8 pl-8' : 'items-center justify-center text-center'} p-4 sm:p-6 md:p-8`}
                  >
                    <input
                      type="text"
                      value={coverSettings.title}
                      onChange={e =>
                        updateCoverSettings('title', e.target.value)
                      }
                      className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4 bg-transparent border-2 border-transparent hover:border-white/50 focus:border-white focus:outline-none text-white px-3 py-2 rounded transition-colors w-full max-w-2xl"
                      placeholder="Enter title..."
                    />
                    <input
                      type="text"
                      value={coverSettings.subtitle}
                      onChange={e =>
                        updateCoverSettings('subtitle', e.target.value)
                      }
                      className="text-base sm:text-lg md:text-xl bg-transparent border-2 border-transparent hover:border-white/50 focus:border-white focus:outline-none text-white px-3 py-2 rounded transition-colors w-full max-w-2xl"
                      placeholder="Enter subtitle..."
                    />
                  </div>
                  {/* Floating Cog Button */}
                  {viewMode === 'edit' && (
                    <button
                      onClick={() => setCoverModalOpen(true)}
                      className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Cover Settings"
                    >
                      <Icon icon="cog" className="w-5 h-5 text-gray-700" />
                    </button>
                  )}
                </div>
              ) : viewMode === 'edit' ? (
                <div
                  onClick={() => {
                    updateCoverSettings('enabled', true)
                    setCoverModalOpen(true)
                  }}
                  className="relative h-32 sm:h-40 rounded-t-lg overflow-hidden bg-gray-200 hover:bg-gray-300 transition-colors cursor-pointer group"
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600">
                    <Icon icon="image-slash" className="w-8 h-8 mb-2" />
                    <p className="text-sm font-medium">Capa desativada</p>
                    <p className="text-xs">Clique para ativar</p>
                  </div>
                </div>
              ) : null}

              {/* Catalog Info Bar */}
              <div className="bg-gray-50 border-b p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
                  {catalogInfo.vendorName && (
                    <div className="flex items-center gap-2">
                      <Icon
                        icon="user"
                        className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-gray-600"
                      />
                      <span className="truncate text-gray-700">
                        {catalogInfo.vendorName}
                      </span>
                    </div>
                  )}
                  {catalogInfo.phoneContact && (
                    <div className="flex items-center gap-2">
                      <Icon
                        icon="phone"
                        className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-gray-600"
                      />
                      <span className="truncate text-gray-700">
                        {catalogInfo.phoneContact}
                      </span>
                    </div>
                  )}
                  {(catalogInfo.availabilityStart ||
                    catalogInfo.availabilityEnd) && (
                    <div className="flex items-center gap-2">
                      <Icon
                        icon="calendar"
                        className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-gray-600"
                      />
                      <span className="truncate text-gray-700">
                        {formatDateRange()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Content Area */}
              {children}
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
      <Dialog open={coverModalOpen} onOpenChange={setCoverModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cover Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Cover Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="coverEnabled" className="text-sm">
                    Enable Cover
                  </Label>
                  <Button
                    variant={coverSettings.enabled ? 'default' : 'outline'}
                    size="sm"
                    onClick={() =>
                      updateCoverSettings('enabled', !coverSettings.enabled)
                    }
                  >
                    {coverSettings.enabled ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>

                {coverSettings.enabled && (
                  <div className="pt-2 border-t">
                    <Label className="text-sm mb-2 block">Text Alignment</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={
                          coverSettings.alignment === 'center'
                            ? 'default'
                            : 'outline'
                        }
                        size="sm"
                        className="flex-1"
                        onClick={() =>
                          updateCoverSettings('alignment', 'center')
                        }
                      >
                        Center
                      </Button>
                      <Button
                        variant={
                          coverSettings.alignment === 'left'
                            ? 'default'
                            : 'outline'
                        }
                        size="sm"
                        className="flex-1"
                        onClick={() => updateCoverSettings('alignment', 'left')}
                      >
                        Left
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Edit title and subtitle directly on the cover
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {coverSettings.enabled && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Background Style</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      variant={
                        coverSettings.backgroundType === 'color'
                          ? 'default'
                          : 'outline'
                      }
                      size="sm"
                      className="flex-1"
                      onClick={() =>
                        updateCoverSettings('backgroundType', 'color')
                      }
                    >
                      Color
                    </Button>
                    <Button
                      variant={
                        coverSettings.backgroundType === 'image'
                          ? 'default'
                          : 'outline'
                      }
                      size="sm"
                      className="flex-1"
                      onClick={() =>
                        updateCoverSettings('backgroundType', 'image')
                      }
                    >
                      Image
                    </Button>
                  </div>

                  {coverSettings.backgroundType === 'color' && (
                    <div>
                      <Label className="text-sm mb-2 block">Select Color</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {colorOptions.map(color => (
                          <button
                            key={color.value}
                            className={`h-12 rounded-lg border-2 transition-all ${
                              coverSettings.backgroundColor === color.value
                                ? 'border-gray-900 scale-105'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                            style={{ backgroundColor: color.value }}
                            onClick={() =>
                              updateCoverSettings(
                                'backgroundColor',
                                color.value
                              )
                            }
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {coverSettings.backgroundType === 'image' && (
                    <div>
                      <Label htmlFor="coverImage" className="text-sm">
                        Image URL
                      </Label>
                      <Input
                        id="coverImage"
                        value={coverSettings.backgroundImage}
                        onChange={e =>
                          updateCoverSettings('backgroundImage', e.target.value)
                        }
                        placeholder="https://..."
                        className="text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Use a high-quality image for best results
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
