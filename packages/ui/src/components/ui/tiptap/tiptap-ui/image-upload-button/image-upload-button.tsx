'use client'

import * as React from 'react'

import { useTiptapEditor } from '../../hooks/use-tiptap-editor'
import { parseShortcutKeys } from '../../lib/tiptap-utils'
import type { UseImageUploadConfig } from '../../tiptap-ui/image-upload-button'
import {
  IMAGE_UPLOAD_SHORTCUT_KEY,
  useImageUpload
} from '../../tiptap-ui/image-upload-button'
import { Badge } from '../../tiptap-ui-primitive/badge'
import type { ButtonProps } from '../../tiptap-ui-primitive/button'
import { Button } from '../../tiptap-ui-primitive/button'

export interface ImageUploadButtonProps
  extends Omit<ButtonProps, 'type'>,
    UseImageUploadConfig {
  text?: string

  showShortcut?: boolean
}

export function ImageShortcutBadge({
  shortcutKeys = IMAGE_UPLOAD_SHORTCUT_KEY
}: {
  shortcutKeys?: string
}) {
  return <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>
}

export const ImageUploadButton = React.forwardRef<
  HTMLButtonElement,
  ImageUploadButtonProps
>(
  (
    {
      editor: providedEditor,
      text,
      hideWhenUnavailable = false,
      onInserted,
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
      canInsert,
      handleImage,
      label,
      isActive,
      shortcutKeys,
      Icon
    } = useImageUpload({
      editor,
      hideWhenUnavailable,
      onInserted
    })

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        handleImage()
      },
      [handleImage, onClick]
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
        disabled={!canInsert}
        data-disabled={!canInsert}
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
            {showShortcut && <ImageShortcutBadge shortcutKeys={shortcutKeys} />}
          </>
        )}
      </Button>
    )
  }
)

ImageUploadButton.displayName = 'ImageUploadButton'
