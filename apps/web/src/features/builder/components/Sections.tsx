import { Section } from '@/features/builder/components/Section'

import { useCatalogBuilder } from '../providers/CatalogBuilderContext'

export function Sections() {
  const { formValues } = useCatalogBuilder()

  const { watch } = formValues

  const { sections } = watch()

  const hasSections = sections && sections.length > 0

  if (!hasSections) {
    return null
  }

  return (
    <div className="flex flex-col gap-8">
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
