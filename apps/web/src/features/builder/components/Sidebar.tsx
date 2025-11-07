import { Button } from '@terraviva/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@terraviva/ui/card'
import { Icon } from '@terraviva/ui/icon'
import { Input } from '@terraviva/ui/input'
import { Label } from '@terraviva/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@terraviva/ui/tabs'

import { useCatalogBuilder } from '../providers/CatalogBuilderContext'

export function Sidebar() {
  const {
    sidebarOpen,
    setSidebarOpen,
    viewMode,
    activeTab,
    setActiveTab,
    updateCatalogInfo,
    catalogInfo,
    formatDateRange
  } = useCatalogBuilder()

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
        className="flex overflow-hidden mt-4 mb-0 "
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
          className="flex-1 overflow-auto px-3 min-h-full"
        >
          <div className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="px-3 sm:px-6">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <Icon icon="file" className="w-4 h-4" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6 pt-0">
                <div>
                  <Label htmlFor="catalogName" className="text-sm">
                    Catalog Name *
                  </Label>
                  <Input
                    id="catalogName"
                    value={catalogInfo.catalogName}
                    onChange={e =>
                      updateCatalogInfo('catalogName', e.target.value)
                    }
                    placeholder="e.g., Spring Collection 2025"
                    className="text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="vendorName" className="text-sm">
                    Vendor Name *
                  </Label>
                  <Input
                    id="vendorName"
                    value={catalogInfo.vendorName}
                    onChange={e =>
                      updateCatalogInfo('vendorName', e.target.value)
                    }
                    placeholder="e.g., Blooms & Petals"
                    className="text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="px-3 sm:px-6">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <Icon icon="phone" className="w-4 h-4" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pt-0">
                <div>
                  <Label htmlFor="phoneContact" className="text-sm">
                    Phone Contact (Call Back) *
                  </Label>
                  <Input
                    id="phoneContact"
                    type="tel"
                    value={catalogInfo.phoneContact}
                    onChange={e =>
                      updateCatalogInfo('phoneContact', e.target.value)
                    }
                    placeholder="e.g., +1 (555) 123-4567"
                    className="text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Customers will use this number to place orders
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="px-3 sm:px-6">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <Icon icon="calendar" className="w-4 h-4" />
                  Availability Period
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6 pt-0">
                <div>
                  <Label htmlFor="availabilityStart" className="text-sm">
                    Start Date *
                  </Label>
                  <Input
                    id="availabilityStart"
                    type="date"
                    value={catalogInfo.availabilityStart}
                    onChange={e =>
                      updateCatalogInfo('availabilityStart', e.target.value)
                    }
                    className="text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="availabilityEnd" className="text-sm">
                    End Date *
                  </Label>
                  <Input
                    id="availabilityEnd"
                    type="date"
                    value={catalogInfo.availabilityEnd}
                    onChange={e =>
                      updateCatalogInfo('availabilityEnd', e.target.value)
                    }
                    className="text-sm"
                  />
                </div>

                {(catalogInfo.availabilityStart ||
                  catalogInfo.availabilityEnd) && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800 font-medium">
                      Available Period
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      {formatDateRange()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
