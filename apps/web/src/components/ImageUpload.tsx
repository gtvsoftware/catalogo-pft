'use client'

import { cn } from '@terraviva/ui/cn'
import { Dialog, DialogContent, DialogTitle } from '@terraviva/ui/dialog'
import { Icon } from '@terraviva/ui/icon'
import { toast } from '@terraviva/ui/sonner'
import { useCallback, useState } from 'react'
import Cropper, { Area, Point } from 'react-easy-crop'

interface ImageUploadProps {
  slug: string
  value?: string
  onChange: (url: string) => void
  onRemove?: () => void
  disabled?: boolean
  maxSize?: number
  accept?: string[]
  enableCrop?: boolean
  cropAspect?: number
}

export function ImageUpload({
  slug,
  value,
  onChange,
  onRemove,
  disabled = false,
  maxSize = 5,
  accept = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  enableCrop = false,
  cropAspect = 16 / 9
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [cropImage, setCropImage] = useState<string | null>(null)
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener('load', () => resolve(image))
      image.addEventListener('error', error => reject(error))
      image.src = url
    })

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area
  ): Promise<string> => {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('No 2d context')
    }

    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    )

    return new Promise(resolve => {
      canvas.toBlob(
        blob => {
          if (!blob) {
            throw new Error('Canvas is empty')
          }
          const reader = new FileReader()
          reader.readAsDataURL(blob)
          reader.onloadend = () => {
            resolve(reader.result as string)
          }
        },
        'image/jpeg',
        0.95
      )
    })
  }

  const onCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels)
    },
    []
  )

  const handleCropConfirm = async () => {
    if (!cropImage || !croppedAreaPixels) return

    try {
      const croppedBase64 = await getCroppedImg(cropImage, croppedAreaPixels)
      const response = await fetch(croppedBase64)
      const blob = await response.blob()
      const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' })

      setCropImage(null)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setCroppedAreaPixels(null)

      await handleUpload(file)
    } catch (error) {
      toast.error('Erro ao cortar imagem', {
        description:
          error instanceof Error ? error.message : 'Erro desconhecido'
      })
    }
  }

  const handleCropCancel = () => {
    setCropImage(null)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const handleUpload = useCallback(
    async (file: File) => {
      if (disabled) return

      if (!accept.includes(file.type)) {
        toast.error('Tipo de arquivo inválido', {
          description: 'Por favor, selecione uma imagem JPEG, PNG, WebP ou GIF.'
        })
        return
      }

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
        formData.append('slug', slug)

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

        // Show compression stats if available
        if (data.compressionRatio && data.compressionRatio > 0) {
          toast.success('Imagem enviada e comprimida!', {
            description: `Tamanho reduzido em ${data.compressionRatio}% (${formatBytes(data.originalSize)} → ${formatBytes(data.compressedSize)})`
          })
        } else {
          toast.success('Imagem enviada com sucesso!')
        }
      } catch (error) {
        toast.error('Erro ao fazer upload', {
          description:
            error instanceof Error ? error.message : 'Erro desconhecido'
        })
      } finally {
        setUploading(false)
      }
    },
    [accept, disabled, maxSize, onChange, slug]
  )

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (enableCrop) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setCropImage(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        handleUpload(file)
      }
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)

    if (disabled) return

    const file = event.dataTransfer.files?.[0]
    if (file) {
      if (enableCrop) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setCropImage(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        handleUpload(file)
      }
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
    <>
      <Dialog
        open={!!cropImage}
        onOpenChange={open => !open && handleCropCancel()}
      >
        <DialogTitle className="hidden">Editar Imagem</DialogTitle>
        <DialogContent className="max-w-4xl h-[90vh] p-0 gap-0 overflow-hidden">
          <div className="relative flex-1 h-[80vh] md:h-[70vh] bg-muted">
            {cropImage && (
              <Cropper
                image={cropImage}
                crop={crop}
                zoom={zoom}
                aspect={cropAspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>
          <div className="px-4 md:p-6 space-y-0 md:space-y-4">
            <div className="space-y-2 hidden md:flex">
              <label className="text-sm font-medium">Zoom</label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={e => setZoom(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCropCancel}
                className="px-4 py-2 border rounded-md hover:bg-muted transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCropConfirm}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
                <p className="text-sm font-medium">Enviando e comprimindo...</p>
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
    </>
  )
}
