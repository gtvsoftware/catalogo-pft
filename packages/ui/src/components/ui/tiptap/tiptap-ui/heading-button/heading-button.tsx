'use client'

import * as React from 'react'

import { useTiptapEditor } from '../../hooks/use-tiptap-editor'
import { parseShortcutKeys } from '../../lib/tiptap-utils'
import type { Level, UseHeadingConfig } from '../../tiptap-ui/heading-button'
import {
  HEADING_SHORTCUT_KEYS,
  useHeading
} from '../../tiptap-ui/heading-button'
import { Badge } from '../../tiptap-ui-primitive/badge'
import type { ButtonProps } from '../../tiptap-ui-primitive/button'
import { Button } from '../../tiptap-ui-primitive/button'

export interface HeadingButtonProps
  extends Omit<ButtonProps, 'type'>,
    UseHeadingConfig {
  text?: string

  showShortcut?: boolean
}

export function HeadingShortcutBadge({
  level,
  shortcutKeys = HEADING_SHORTCUT_KEYS[level]
}: {
  level: Level
  shortcutKeys?: string
}) {
  return <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>
}

export const HeadingButton = React.forwardRef<
  HTMLButtonElement,
  HeadingButtonProps
>(
  (
    {
      editor: providedEditor,
      level,
      text,
      hideWhenUnavailable = false,
      onToggled,
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
      canToggle,
      isActive,
      handleToggle,
      label,
      Icon,
      shortcutKeys
    } = useHeading({
      editor,
      level,
      hideWhenUnavailable,
      onToggled
    })

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        handleToggle()
      },
      [handleToggle, onClick]
    )

    if (!isVisible) {
      return null
    }

    return (
      <Button
        type="button"
        data-style="ghost"
        data-active-state={isActive ? 'on' : 'off'}
        role="button"
        tabIndex={-1}
        disabled={!canToggle}
        data-disabled={!canToggle}
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
              <HeadingShortcutBadge level={level} shortcutKeys={shortcutKeys} />
            )}
          </>
        )}
      </Button>
    )
  }
)

HeadingButton.displayName = 'HeadingButton'
