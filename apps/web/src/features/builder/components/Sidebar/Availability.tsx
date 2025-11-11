import { Input } from '@terraviva/ui/input'
import { Label } from '@terraviva/ui/label'
import { useEffect, useState } from 'react'

import { useCatalogBuilder } from '../../providers/CatalogBuilderContext'

export function Availability() {
  const { formatDateRange, formValues } = useCatalogBuilder()

  const availabilityStart = formValues.watch('availabilityStart')
  const availabilityEnd = formValues.watch('availabilityEnd')

  const [localAvailabilityStart, setLocalAvailabilityStart] = useState(
    availabilityStart || ''
  )
  const [localAvailabilityEnd, setLocalAvailabilityEnd] = useState(
    availabilityEnd || ''
  )

  useEffect(() => {
    if (availabilityStart !== undefined)
      setLocalAvailabilityStart(availabilityStart)
  }, [availabilityStart])

  useEffect(() => {
    if (availabilityEnd !== undefined) setLocalAvailabilityEnd(availabilityEnd)
  }, [availabilityEnd])

  return (
    <div className="space-y-4 pt-2 pb-4 px-4">
      <div>
        <Label htmlFor="availabilityStart" className="text-sm">
          Data de Início *
        </Label>
        <Input
          id="availabilityStart"
          type="date"
          value={localAvailabilityStart}
          onChange={e => setLocalAvailabilityStart(e.target.value)}
          onBlur={() => {
            if (localAvailabilityStart !== availabilityStart) {
              formValues.setValue('availabilityStart', localAvailabilityStart)
            }
          }}
          className="text-sm"
        />
      </div>

      <div>
        <Label htmlFor="availabilityEnd" className="text-sm">
          Data de Término *
        </Label>
        <Input
          id="availabilityEnd"
          type="date"
          value={localAvailabilityEnd}
          onChange={e => setLocalAvailabilityEnd(e.target.value)}
          onBlur={() => {
            if (localAvailabilityEnd !== availabilityEnd) {
              formValues.setValue('availabilityEnd', localAvailabilityEnd)
            }
          }}
          className="text-sm"
        />
      </div>

      {(availabilityStart || availabilityEnd) && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 font-medium">
            Período Disponível
          </p>
          <p className="text-xs text-blue-600 mt-1">{formatDateRange()}</p>
        </div>
      )}
    </div>
  )
}
