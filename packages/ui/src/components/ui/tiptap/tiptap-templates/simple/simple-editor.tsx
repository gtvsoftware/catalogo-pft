'use client'

import '../../styles/_keyframe-animations.scss'
import '../../styles/_variables.scss'
import '../../tiptap-node/blockquote-node/blockquote-node.scss'
import '../../tiptap-node/code-block-node/code-block-node.scss'
import '../../tiptap-node/heading-node/heading-node.scss'
import '../../tiptap-node/horizontal-rule-node/horizontal-rule-node.scss'
import '../../tiptap-node/image-node/image-node.scss'
import '../../tiptap-node/list-node/list-node.scss'
import '../../tiptap-node/paragraph-node/paragraph-node.scss'
import './simple-editor.scss'

import { Highlight } from '@tiptap/extension-highlight'
import { Image } from '@tiptap/extension-image'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { Placeholder } from '@tiptap/extension-placeholder'
import { Subscript } from '@tiptap/extension-subscript'
import { Superscript } from '@tiptap/extension-superscript'
import { TextAlign } from '@tiptap/extension-text-align'
import { Typography } from '@tiptap/extension-typography'
import { Selection } from '@tiptap/extensions'
import { EditorContent, EditorContext, useEditor } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import * as React from 'react'

import { useCursorVisibility } from '../../hooks/use-cursor-visibility'
import { useIsMobile } from '../../hooks/use-mobile'
import { useScrolling } from '../../hooks/use-scrolling'
import { useWindowSize } from '../../hooks/use-window-size'
import { ArrowLeftIcon } from '../../tiptap-icons/arrow-left-icon'
import { HighlighterIcon } from '../../tiptap-icons/highlighter-icon'
import { LinkIcon } from '../../tiptap-icons/link-icon'
import { HorizontalRule } from '../../tiptap-node/horizontal-rule-node/horizontal-rule-node-extension'
import { Button } from '../../tiptap-ui-primitive/button'
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator
} from '../../tiptap-ui-primitive/toolbar'
import {
  ColorHighlightPopover,
  ColorHighlightPopoverButton,
  ColorHighlightPopoverContent
} from '../../tiptap-ui/color-highlight-popover'
import {
  LinkButton,
  LinkContent,
  LinkPopover
} from '../../tiptap-ui/link-popover'
import { ListDropdownMenu } from '../../tiptap-ui/list-dropdown-menu'
import { MarkButton } from '../../tiptap-ui/mark-button'
import { TextAlignButton } from '../../tiptap-ui/text-align-button'

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile
}: {
  onHighlighterClick: () => void
  onLinkClick: () => void
  isMobile: boolean
}) => {
  return (
    <>
      {/* <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup> */}

      {/* <ToolbarSeparator /> */}

      {/* <ToolbarGroup>

        <HeadingDropdownMenu levels={[1, 2, 3, 4]} portal={isMobile} />
    
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup> */}

      {/* <ToolbarSeparator /> */}

      <ToolbarGroup>
        <MarkButton type="bold" tooltip="Negrito" />
        <MarkButton type="italic" tooltip="Itálico" />
        <MarkButton type="strike" tooltip="Tachado" />
        <MarkButton type="code" tooltip="Código" />
        <MarkButton type="underline" tooltip="Sublinhado" />
        {!isMobile ? (
          <ColorHighlightPopover tooltip="Realçar texto" />
        ) : (
          <ColorHighlightPopoverButton
            onClick={onHighlighterClick}
            tooltip="Realçar texto"
          />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
        <ListDropdownMenu
          types={['bulletList', 'orderedList', 'taskList']}
          portal={isMobile}
          tooltip="Lista"
        />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="superscript" tooltip="Sobrescrito" />
        <MarkButton type="subscript" tooltip="Subescrito" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>

      {/* <ToolbarGroup>
        <ThemeToggle />
      </ToolbarGroup> */}
    </>
  )
}

const MobileToolbarContent = ({
  type,
  onBack
}: {
  type: 'highlighter' | 'link'
  onBack: () => void
}) => (
  <>
    <ToolbarGroup>
      <Button data-style="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === 'highlighter' ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === 'highlighter' ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
)

interface TipTapEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  disabled?: boolean
}

export function SimpleEditor({
  content,
  onChange,
  placeholder = 'Digite aqui...',
  disabled = false
}: TipTapEditorProps) {
  const isMobile = useIsMobile()
  const windowSize = useWindowSize()
  const [mobileView, setMobileView] = React.useState<
    'main' | 'highlighter' | 'link'
  >('main')
  const toolbarRef = React.useRef<HTMLDivElement>(null)

  const editor = useEditor({
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
        'aria-label': 'Main content area, start typing to enter text.',
        class: 'simple-editor border-border'
      }
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true
        }
      }),
      HorizontalRule,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
      Selection,
      Placeholder.configure({
        placeholder
      })
      // ImageUploadNode.configure({
      //   accept: 'image/*',
      //   maxSize: MAX_FILE_SIZE,
      //   limit: 3,
      //   upload: handleImageUpload,
      //   onError: error => console.error('Upload failed:', error)
      // })
    ],
    content
  })

  const isScrolling = useScrolling()
  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0
  })

  React.useEffect(() => {
    if (!isMobile && mobileView !== 'main') {
      setMobileView('main')
    }
  }, [isMobile, mobileView])

  return (
    <div className="simple-editor-wrapper">
      <EditorContext.Provider value={{ editor }}>
        {!disabled ? (
          <Toolbar
            ref={toolbarRef}
            style={{
              ...(isScrolling && isMobile
                ? { opacity: 0, transition: 'opacity 0.1s ease-in-out' }
                : {}),
              ...(isMobile
                ? {
                    bottom: `calc(100% - ${windowSize.height - rect.y}px)`
                  }
                : {})
            }}
          >
            {mobileView === 'main' ? (
              <MainToolbarContent
                onHighlighterClick={() => setMobileView('highlighter')}
                onLinkClick={() => setMobileView('link')}
                isMobile={isMobile}
              />
            ) : (
              <MobileToolbarContent
                type={mobileView === 'highlighter' ? 'highlighter' : 'link'}
                onBack={() => setMobileView('main')}
              />
            )}
          </Toolbar>
        ) : (
          <></>
        )}

        <EditorContent
          editor={editor}
          role="presentation"
          className="simple-editor-content p-0"
        />
      </EditorContext.Provider>
    </div>
  )
}
