'use client'

import {
  closestCenter,
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { restrictToParentElement } from '@dnd-kit/modifiers'
import { rectSortingStrategy, SortableContext } from '@dnd-kit/sortable'
import { Icon } from '@terraviva/ui/icon'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { v4 as randomUUID } from 'uuid'

import { Banner } from '../../../components/banner/Banner'
import { DraggableSection } from '../../../components/DraggableSection'

export default function Page(): React.ReactElement {
  const { control, watch } = useFormContext<catalogoFormType>()

  const { append, move } = useFieldArray({
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
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor))

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (over && active.id !== over?.id) {
      if (
        active.data.current?.sortable?.index !== undefined &&
        over.data.current?.sortable?.index !== undefined
      )
        move(
          active.data.current?.sortable?.index,
          over.data.current?.sortable?.index
        )
    }
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
          <DndContext
            sensors={sensors}
            modifiers={[restrictToParentElement]}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={sections} strategy={rectSortingStrategy}>
              {sections.map((section, index) => (
                <DraggableSection key={section.id} sectionIndex={index} />
              ))}
            </SortableContext>
          </DndContext>
        </div>
        <NewSectionButton />
      </div>
    </div>
  )
}
