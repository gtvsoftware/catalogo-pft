'use client'

import type { Editor } from '@tiptap/react'
import * as React from 'react'

import { useTiptapEditor } from '../../hooks/use-tiptap-editor'
import { isNodeInSchema } from '../../lib/tiptap-utils'
import { ListIcon } from '../../tiptap-icons/list-icon'
import { ListOrderedIcon } from '../../tiptap-icons/list-ordered-icon'
import { ListTodoIcon } from '../../tiptap-icons/list-todo-icon'
import {
  canToggleList,
  isListActive,
  type ListType,
  listIcons
} from '../../tiptap-ui/list-button'

export interface UseListDropdownMenuConfig {
  editor?: Editor | null

  types?: ListType[]

  hideWhenUnavailable?: boolean
}

export interface ListOption {
  label: string
  type: ListType
  icon: React.ElementType
}

export const listOptions: ListOption[] = [
  {
    label: 'Lista com marcadores',
    type: 'bulletList',
    icon: ListIcon
  },
  {
    label: 'Lista ordenada',
    type: 'orderedList',
    icon: ListOrderedIcon
  },
  {
    label: 'Lista de tarefas',
    type: 'taskList',
    icon: ListTodoIcon
  }
]

export function canToggleAnyList(
  editor: Editor | null,
  listTypes: ListType[]
): boolean {
  if (!editor || !editor.isEditable) return false
  return listTypes.some(type => canToggleList(editor, type))
}

export function isAnyListActive(
  editor: Editor | null,
  listTypes: ListType[]
): boolean {
  if (!editor || !editor.isEditable) return false
  return listTypes.some(type => isListActive(editor, type))
}

export function getFilteredListOptions(
  availableTypes: ListType[]
): typeof listOptions {
  return listOptions.filter(
    option => !option.type || availableTypes.includes(option.type)
  )
}

export function shouldShowListDropdown(params: {
  editor: Editor | null
  listTypes: ListType[]
  hideWhenUnavailable: boolean
  listInSchema: boolean
  canToggleAny: boolean
}): boolean {
  const { editor, hideWhenUnavailable, listInSchema, canToggleAny } = params

  if (!listInSchema || !editor) {
    return false
  }

  if (hideWhenUnavailable && !editor.isActive('code')) {
    return canToggleAny
  }

  return true
}

export function getActiveListType(
  editor: Editor | null,
  availableTypes: ListType[]
): ListType | undefined {
  if (!editor || !editor.isEditable) return undefined
  return availableTypes.find(type => isListActive(editor, type))
}

export function useListDropdownMenu(config?: UseListDropdownMenuConfig) {
  const {
    editor: providedEditor,
    types = ['bulletList', 'orderedList', 'taskList'],
    hideWhenUnavailable = false
  } = config || {}

  const { editor } = useTiptapEditor(providedEditor)
  const [isVisible, setIsVisible] = React.useState(false)

  const listInSchema = types.some(type => isNodeInSchema(type, editor))

  const filteredLists = React.useMemo(
    () => getFilteredListOptions(types),
    [types]
  )

  const canToggleAny = canToggleAnyList(editor, types)
  const isAnyActive = isAnyListActive(editor, types)
  const activeType = getActiveListType(editor, types)
  const activeList = filteredLists.find(option => option.type === activeType)

  React.useEffect(() => {
    if (!editor) return

    const handleSelectionUpdate = () => {
      setIsVisible(
        shouldShowListDropdown({
          editor,
          listTypes: types,
          hideWhenUnavailable,
          listInSchema,
          canToggleAny
        })
      )
    }

    handleSelectionUpdate()

    editor.on('selectionUpdate', handleSelectionUpdate)

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate)
    }
  }, [canToggleAny, editor, hideWhenUnavailable, listInSchema, types])

  return {
    isVisible,
    activeType,
    isActive: isAnyActive,
    canToggle: canToggleAny,
    types,
    filteredLists,
    label: 'List',
    Icon: activeList ? listIcons[activeList.type] : ListIcon
  }
}
