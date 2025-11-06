'use client'

import { cn } from '@terraviva/ui/cn'
import { Icon } from '@terraviva/ui/icon'
import { toast } from '@terraviva/ui/sonner'
import { useCallback, useState } from 'react'

interface ImageUploadProps {
  id: string
  value?: string
  onChange: (url: string) => void
  onRemove?: () => void
  disabled?: boolean
  maxSize?: number // in MB
  accept?: string[]
}

export function ImageUpload({
  id,
  value,
  onChange,
  onRemove,
  disabled = false,
  maxSize = 5,
  accept = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const handleUpload = useCallback(
    async (file: File) => {
      if (disabled) return

      // Validate file type
      if (!accept.includes(file.type)) {
        toast.error('Tipo de arquivo inválido', {
          description: 'Por favor, selecione uma imagem JPEG, PNG, WebP ou GIF.'
        })
        return
      }

      // Validate file size
      const maxBytes = maxSize * 1024 * 1024
      if (file.size > maxBytes) {
        toast.error('Arquivo muito grande', {
          description: `O tamanho máximo permitido é ${maxSize}MB.`
        })
        return
      }

      setUploading(true)

      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('id', id)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Erro ao fazer upload')
        }

        const data = await response.json()
        onChange(data.url)

        toast.success('Imagem enviada com sucesso!')
      } catch (error) {
        toast.error('Erro ao fazer upload', {
          description:
            error instanceof Error ? error.message : 'Erro desconhecido'
        })
      } finally {
        setUploading(false)
      }
    },
    [accept, disabled, maxSize, onChange, id]
  )

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)

    if (disabled) return

    const file = event.dataTransfer.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleRemove = async () => {
    if (disabled || !value) return

    try {
      // Extract filename from URL
      const url = new URL(value)
      const filename = url.pathname.split('/').pop()

      if (filename) {
        await fetch(`/api/upload?filename=${filename}`, {
          method: 'DELETE'
        })
      }

      onRemove?.()
      toast.success('Imagem removida com sucesso!')
    } catch (error) {
      toast.error('Erro ao remover imagem', {
        description:
          error instanceof Error ? error.message : 'Erro desconhecido'
      })
    }
  }

  if (value && !uploading) {
    return (
      <div className="relative group">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border-2 border-border">
          <img
            src={value}
            alt="Preview"
            className="object-cover w-full h-full"
          />
          {!disabled && (
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleRemove}
                className="p-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
              >
                <Icon icon="trash" className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        'relative aspect-video w-full rounded-lg border-2 border-dashed transition-colors',
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50',
        disabled && 'opacity-50 cursor-not-allowed',
        uploading && 'pointer-events-none'
      )}
    >
      <label
        htmlFor="image-upload"
        className={cn(
          'flex flex-col items-center justify-center h-full cursor-pointer',
          disabled && 'cursor-not-allowed'
        )}
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          {uploading ? (
            <>
              <Icon
                icon="spinner"
                className="w-10 h-10 animate-spin text-primary"
              />
              <p className="text-sm font-medium">Enviando imagem...</p>
            </>
          ) : (
            <>
              <Icon icon="cloud-upload" className="w-10 h-10" />
              <div className="text-center">
                <p className="text-sm font-medium">
                  Clique para selecionar ou arraste uma imagem
                </p>
                <p className="text-xs mt-1">
                  JPEG, PNG, WebP ou GIF até {maxSize}MB
                </p>
              </div>
            </>
          )}
        </div>
        <input
          id="image-upload"
          type="file"
          accept={accept.join(',')}
          onChange={handleFileSelect}
          disabled={disabled || uploading}
          className="hidden"
        />
      </label>
    </div>
  )
}
