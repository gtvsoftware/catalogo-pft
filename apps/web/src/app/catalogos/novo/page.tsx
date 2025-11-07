'use client'

import { Icon } from '@terraviva/ui/icon'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { v4 as randomUUID } from 'uuid'

import { Banner } from '../../../components/banner/Banner'
import { Section } from '@/components/Section'

export default function Page(): React.ReactElement {
  const { control, watch } = useFormContext<catalogoFormType>()

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

  const NewSectionButton = () => (
    <div
      className="w-full border-2 border-dashed min-h-64 flex flex-col items-center justify-center  bg-gray-100 rounded-md cursor-pointer gap-2"
      onClick={handleSection}
    >
      <Icon icon="plus-circle" className="text-primary-500 text-2xl" />
      <p className="font-medium">Nova seção</p>
    </div>
  )

  return (
    <div className="w-screen flex justify-center">
      <div className="flex flex-col items-center gap-8 max-w-[800px] w-full">
        <Banner />

        <div className="flex flex-col gap-8 w-full">
          {sections.map((section, index) => (
            <Section key={section.id} sectionIndex={index} />
          ))}
        </div>
        <NewSectionButton />
      </div>
    </div>
  )
}
