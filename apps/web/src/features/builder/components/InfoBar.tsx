import { Icon } from '@terraviva/ui/icon'

import { useCatalogBuilder } from '../providers/CatalogBuilderContext'

export function InfoBar() {
  const { catalogInfo, formatDateRange } = useCatalogBuilder()

  return (
    <>
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
          {(catalogInfo.availabilityStart || catalogInfo.availabilityEnd) && (
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
    </>
  )
}
