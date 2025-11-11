'use client'

import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { restrictToParentElement } from '@dnd-kit/modifiers'
import { rectSortingStrategy, SortableContext } from '@dnd-kit/sortable'
import { Button } from '@terraviva/ui/button'
import { Icon } from '@terraviva/ui/icon'
import { useEffect, useState } from 'react'
import { Controller, useFieldArray, useFormContext } from 'react-hook-form'

import { useCatalogBuilder } from '@/features/builder/providers/CatalogBuilderContext'

import { CreateItemFormModal } from './CreateItemFormModal'
import { DeleteModal } from './DeleteModal'
import { DraggableItem } from './DraggableItem'

interface SectionProps {
  sectionIndex: number
}

export function Section({ sectionIndex }: SectionProps): React.ReactElement {
  const { control, watch } = useFormContext<catalogoFormType>()

  const {
    move,
    append,
    remove: removeItem
  } = useFieldArray({
    name: `sections.${sectionIndex}.items`,
    control
  })

  const { remove, swap } = useFieldArray({
    name: `sections`,
    control
  })

  const { sections } = watch()
  const section = watch(`sections.${sectionIndex}`)
  const items = watch(`sections.${sectionIndex}.items`)

  const [localTitle, setLocalTitle] = useState(section?.title || '')

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5
      }
    })
  )

  const { viewMode } = useCatalogBuilder()

  useEffect(() => {
    if (section?.title !== undefined) {
      setLocalTitle(section.title)
    }
  }, [section?.title])

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

  return (
    section && (
      <div className="w-full flex flex-col gap-4 bg-white ">
        <div className="flex items-center justify-between mx-4">
          <Controller
            name={`sections.${sectionIndex}.title`}
            control={control}
            render={({ field }) =>
              viewMode === 'preview' ? (
                <h2 className="text-xl font-medium">
                  {field.value || 'Seção'}
                </h2>
              ) : (
                <input
                  value={localTitle}
                  onChange={e => setLocalTitle(e.target.value)}
                  onBlur={() => field.onChange(localTitle)}
                  className="text-xl font-medium outline-none"
                  style={{
                    width: `${Math.max(localTitle?.length ?? 5, 5)}ch`
                  }}
                  placeholder="Seção"
                />
              )
            }
          />

          {viewMode !== 'preview' && (
            <div className="flex gap-2">
              <DeleteModal
                trigger={
                  <div className="w-8 h-8 border rounded-sm cursor-pointer flex items-center justify-center hover:bg-gray-100">
                    <Icon icon="trash-can" family="duotone" />
                  </div>
                }
                title="Excluir seção"
                message="Você tem certeza que deseja excluir a seção?"
                removeFn={() => {
                  remove(sectionIndex)
                }}
              />

              <Button
                disabled={
                  sections.length === 1 || sectionIndex === sections.length - 1
                }
                onClick={() => swap(sectionIndex, sectionIndex + 1)}
                variant={'outline'}
                className="p-0 w-8 h-8 border rounded-sm flex items-center justify-center hover:bg-gray-100"
              >
                <Icon icon="caret-down" />
              </Button>
              <Button
                disabled={sections.length === 1 || sectionIndex === 0}
                onClick={() => swap(sectionIndex, sectionIndex - 1)}
                variant={'outline'}
                className="p-0 w-8 h-8 border rounded-sm flex items-center justify-center hover:bg-gray-100"
              >
                <Icon icon="caret-up" />
              </Button>
            </div>
          )}
        </div>

        <DndContext
          sensors={sensors}
          modifiers={[restrictToParentElement]}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-2">
              {items.map((item, index) => (
                <DraggableItem
                  key={item.id}
                  itemIndex={index}
                  sectionIndex={sectionIndex}
                  removeFn={() => removeItem(index)}
                  viewMode={viewMode}
                />
              ))}
              {viewMode !== 'preview' && (
                <CreateItemFormModal append={append} />
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    )
  )
}
