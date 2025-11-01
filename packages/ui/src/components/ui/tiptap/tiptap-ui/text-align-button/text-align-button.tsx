'use client'

import * as React from 'react'

import { useTiptapEditor } from '../../hooks/use-tiptap-editor'
import { parseShortcutKeys } from '../../lib/tiptap-utils'
import type {
  TextAlign,
  UseTextAlignConfig
} from '../../tiptap-ui/text-align-button'
import {
  TEXT_ALIGN_SHORTCUT_KEYS,
  useTextAlign
} from '../../tiptap-ui/text-align-button'
import { Badge } from '../../tiptap-ui-primitive/badge'
import type { ButtonProps } from '../../tiptap-ui-primitive/button'
import { Button } from '../../tiptap-ui-primitive/button'

export interface TextAlignButtonProps
  extends Omit<ButtonProps, 'type'>,
    UseTextAlignConfig {
  text?: string

  showShortcut?: boolean
}

export function TextAlignShortcutBadge({
  align,
  shortcutKeys = TEXT_ALIGN_SHORTCUT_KEYS[align]
}: {
  align: TextAlign
  shortcutKeys?: string
}) {
  return <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>
}

export const TextAlignButton = React.forwardRef<
  HTMLButtonElement,
  TextAlignButtonProps
>(
  (
    {
      editor: providedEditor,
      align,
      text,
      hideWhenUnavailable = false,
      onAligned,
      showShortcut = false,
      onClick,
      children,
      ...buttonProps
    },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor)
    const {
      isVisible,
      handleTextAlign,
      label,
      canAlign,
      isActive,
      Icon,
      shortcutKeys
    } = useTextAlign({
      editor,
      align,
      hideWhenUnavailable,
      onAligned
    })

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        handleTextAlign()
      },
      [handleTextAlign, onClick]
    )

    if (!isVisible) {
      return null
    }

    return (
      <Button
        type="button"
        disabled={!canAlign}
        data-style="ghost"
        data-active-state={isActive ? 'on' : 'off'}
        data-disabled={!canAlign}
        role="button"
        tabIndex={-1}
        aria-label={label}
        aria-pressed={isActive}
        tooltip={label}
        onClick={handleClick}
        {...buttonProps}
        ref={ref}
      >
        {children ?? (
          <>
            <Icon className="tiptap-button-icon" />
            {text && <span className="tiptap-button-text">{text}</span>}
            {showShortcut && (
              <TextAlignShortcutBadge
                align={align}
                shortcutKeys={shortcutKeys}
              />
            )}
          </>
        )}
      </Button>
    )
  }
)

TextAlignButton.displayName = 'TextAlignButton'
