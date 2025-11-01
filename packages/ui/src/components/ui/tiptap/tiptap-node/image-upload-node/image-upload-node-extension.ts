import { mergeAttributes, Node, ReactNodeViewRenderer } from '@tiptap/react'

import { ImageUploadNode as ImageUploadNodeComponent } from '../../tiptap-node/image-upload-node/image-upload-node'

export type UploadFunction = (
  file: File,
  onProgress?: (event: { progress: number }) => void,
  abortSignal?: AbortSignal
) => Promise<string>

export interface ImageUploadNodeOptions {
  accept?: string

  limit?: number

  maxSize?: number

  upload?: UploadFunction

  onError?: (error: Error) => void

  onSuccess?: (url: string) => void
}

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    imageUpload: {
      setImageUploadNode: (options?: ImageUploadNodeOptions) => ReturnType
    }
  }
}

export const ImageUploadNode = Node.create<ImageUploadNodeOptions>({
  name: 'imageUpload',

  group: 'block',

  draggable: true,

  atom: true,

  addOptions() {
    return {
      accept: 'image/*',
      limit: 1,
      maxSize: 0,
      upload: undefined,
      onError: undefined,
      onSuccess: undefined
    }
  },

  addAttributes() {
    return {
      accept: {
        default: this.options.accept
      },
      limit: {
        default: this.options.limit
      },
      maxSize: {
        default: this.options.maxSize
      }
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="image-upload"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes({ 'data-type': 'image-upload' }, HTMLAttributes)
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageUploadNodeComponent)
  },

  addCommands() {
    return {
      setImageUploadNode:
        (options = {}) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options
          })
        }
    }
  },

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { selection } = editor.state
        const { nodeAfter } = selection.$from

        if (
          nodeAfter &&
          nodeAfter.type.name === 'imageUpload' &&
          editor.isActive('imageUpload')
        ) {
          const nodeEl = editor.view.nodeDOM(selection.$from.pos)
          if (nodeEl && nodeEl instanceof HTMLElement) {
            const firstChild = nodeEl.firstChild
            if (firstChild && firstChild instanceof HTMLElement) {
              firstChild.click()
              return true
            }
          }
        }
        return false
      }
    }
  }
})

export default ImageUploadNode
