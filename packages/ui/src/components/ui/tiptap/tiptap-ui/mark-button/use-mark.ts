'use client'

import type { Editor } from '@tiptap/react'
import * as React from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

import { useIsMobile } from '../../hooks/use-mobile'
import { useTiptapEditor } from '../../hooks/use-tiptap-editor'
import { isMarkInSchema, isNodeTypeSelected } from '../../lib/tiptap-utils'
import { BoldIcon } from '../../tiptap-icons/bold-icon'
import { Code2Icon } from '../../tiptap-icons/code2-icon'
import { ItalicIcon } from '../../tiptap-icons/italic-icon'
import { StrikeIcon } from '../../tiptap-icons/strike-icon'
import { SubscriptIcon } from '../../tiptap-icons/subscript-icon'
import { SuperscriptIcon } from '../../tiptap-icons/superscript-icon'
import { UnderlineIcon } from '../../tiptap-icons/underline-icon'

export type Mark =
  | 'bold'
  | 'italic'
  | 'strike'
  | 'code'
  | 'underline'
  | 'superscript'
  | 'subscript'

export interface UseMarkConfig {
  editor?: Editor | null

  type: Mark

  hideWhenUnavailable?: boolean

  onToggled?: () => void
}

export const markIcons = {
  bold: BoldIcon,
  italic: ItalicIcon,
  underline: UnderlineIcon,
  strike: StrikeIcon,
  code: Code2Icon,
  superscript: SuperscriptIcon,
  subscript: SubscriptIcon
}

export const MARK_SHORTCUT_KEYS: Record<Mark, string> = {
  bold: 'mod+b',
  italic: 'mod+i',
  underline: 'mod+u',
  strike: 'mod+shift+s',
  code: 'mod+e',
  superscript: 'mod+.',
  subscript: 'mod+,'
}

export function canToggleMark(editor: Editor | null, type: Mark): boolean {
  if (!editor || !editor.isEditable) return false
  if (!isMarkInSchema(type, editor) || isNodeTypeSelected(editor, ['image']))
    return false

  return editor.can().toggleMark(type)
}

export function isMarkActive(editor: Editor | null, type: Mark): boolean {
  if (!editor || !editor.isEditable) return false
  return editor.isActive(type)
}

export function toggleMark(editor: Editor | null, type: Mark): boolean {
  if (!editor || !editor.isEditable) return false
  if (!canToggleMark(editor, type)) return false

  return editor.chain().focus().toggleMark(type).run()
}

export function shouldShowButton(props: {
  editor: Editor | null
  type: Mark
  hideWhenUnavailable: boolean
}): boolean {
  const { editor, type, hideWhenUnavailable } = props

  if (!editor || !editor.isEditable) return false
  if (!isMarkInSchema(type, editor)) return false

  if (hideWhenUnavailable && !editor.isActive('code')) {
    return canToggleMark(editor, type)
  }

  return true
}

export function getFormattedMarkName(type: Mark): string {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

export function useMark(config: UseMarkConfig) {
  const {
    editor: providedEditor,
    type,
    hideWhenUnavailable = false,
    onToggled
  } = config

  const { editor } = useTiptapEditor(providedEditor)
  const isMobile = useIsMobile()
  const [isVisible, setIsVisible] = React.useState<boolean>(true)
  const canToggle = canToggleMark(editor, type)
  const isActive = isMarkActive(editor, type)

  React.useEffect(() => {
    if (!editor) return

    const handleSelectionUpdate = () => {
      setIsVisible(shouldShowButton({ editor, type, hideWhenUnavailable }))
    }

    handleSelectionUpdate()

    editor.on('selectionUpdate', handleSelectionUpdate)

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate)
    }
  }, [editor, type, hideWhenUnavailable])

  const handleMark = React.useCallback(() => {
    if (!editor) return false

    const success = toggleMark(editor, type)
    if (success) {
      onToggled?.()
    }
    return success
  }, [editor, type, onToggled])

  useHotkeys(
    MARK_SHORTCUT_KEYS[type],
    event => {
      event.preventDefault()
      handleMark()
    },
    {
      enabled: isVisible && canToggle,
      enableOnContentEditable: !isMobile,
      enableOnFormTags: true
    }
  )

  return {
    isVisible,
    isActive,
    handleMark,
    canToggle,
    label: getFormattedMarkName(type),
    shortcutKeys: MARK_SHORTCUT_KEYS[type],
    Icon: markIcons[type]
  }
}
