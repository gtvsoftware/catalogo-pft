import { Section } from '@/components/Section'

import { useCatalogBuilder } from '../providers/CatalogBuilderContext'

export function Sections() {
  const { formValues } = useCatalogBuilder()

  const { watch } = formValues

  const { sections } = watch()

  return (
    <div className="flex flex-col py-4 sm:py-6 md:py-8 gap-8">
      {!!sections.length && (
        <div className="flex flex-col gap-8 w-full">
          {sections.map((section, index) => (
            <Section key={section.id} sectionIndex={index} />
          ))}
        </div>
      )}
    </div>
  )
}
