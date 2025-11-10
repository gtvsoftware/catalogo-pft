import { useCatalogBuilder } from '../providers/CatalogBuilderContext'

export function InfoBar() {
  const { formValues } = useCatalogBuilder()

  const availabilityStart = formValues.watch('availabilityStart')
  const availabilityEnd = formValues.watch('availabilityEnd')

  return (
    <div className="space-y-1 bg-gray-100 px-8 py-4">
      {availabilityStart && availabilityEnd ? (
        <div className="text-xs text-gray-400">
          <p>
            <span>Período de validade:</span>{' '}
            {new Date(availabilityStart).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            })}
            {' até '}
            {new Date(availabilityEnd).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            })}
          </p>
        </div>
      ) : availabilityEnd ? (
        <div className="text-xs text-gray-400">
          <p>
            <span className="font-medium">Disponível até:</span>{' '}
            {new Date(availabilityEnd).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            })}
          </p>
        </div>
      ) : null}
    </div>
  )
}
