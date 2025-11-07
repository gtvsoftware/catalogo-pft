import { Icon } from '@terraviva/ui/icon'
import { useFieldArray } from 'react-hook-form'
import { v4 as randomUUID } from 'uuid'

import { useCatalogBuilder } from '@/features/builder/providers/CatalogBuilderContext'

export function NewSectionButton() {
  const { formValues } = useCatalogBuilder()

  const { control, watch } = formValues

  const { append } = useFieldArray({
    name: 'sections',
    control
  })

  const { sections } = watch()

  const handleSection = () => {
    const section: sectionFormType = {
      id: randomUUID(),
      title: `Seção ${sections.length + 1}`,
      items: []
    }

    append(section)
  }

  return (
    <div
      className="w-full border-2 mt-4 sm:mt-6 md:mt-8 border-dashed min-h-64 flex flex-col items-center justify-center bg-gray-100 rounded-md cursor-pointer gap-2"
      onClick={handleSection}
    >
      <Icon icon="plus" className="text-gray-500 text-xl" />
      <p className="font-medium text-gray-500 max-w-40 text-center text-sm">
        Clique para adicionar uma seção
      </p>
    </div>
  )
}
