import { Button } from '@terraviva/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@terraviva/ui/dialog'
import { Icon } from '@terraviva/ui/icon'
import { Label } from '@terraviva/ui/label'
import { Slider } from '@terraviva/ui/slider'
import { Switch } from '@terraviva/ui/switch'
import { useEffect, useRef, useState } from 'react'

import { ImageUpload } from '@/components/ImageUpload'

import { useCatalogBuilder } from '../providers/CatalogBuilderContext'

const colorOptions = [
  { name: 'Verde', value: '#4a9e2d' },
  { name: 'Laranja', value: '#f97316' },
  { name: 'Azul', value: '#3b82f6' },
  { name: 'Ciano', value: '#14b8a6' },
  { name: 'Roxo', value: '#a855f7' },
  { name: 'Vermelho', value: '#ef4444' },
  { name: 'Rosa', value: '#444' },
  { name: 'Cinza', value: '#f4f4f4' }
]

export function Cover() {
  const { formValues, viewMode, setCoverModalOpen, coverModalOpen } =
    useCatalogBuilder()

  const catalogId = formValues.watch('id')

  const coverSettings = formValues.watch('cover')

  const getCoverStyle = (): React.CSSProperties => {
    if (!coverSettings) return {}

    if (
      coverSettings.backgroundType === 'image' &&
      coverSettings.backgroundImage
    ) {
      return {
        backgroundImage: `url(${coverSettings.backgroundImage})`,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    }
    return {
      backgroundColor: coverSettings.backgroundColor
    }
  }

  const [localTitle, setLocalTitle] = useState(coverSettings?.title || '')
  const [localSubtitle, setLocalSubtitle] = useState(
    coverSettings?.subtitle || ''
  )
  const [localOpacity, setLocalOpacity] = useState(
    coverSettings?.overlayOpacity ?? 30
  )
  const opacityTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (coverSettings?.title !== undefined) {
      setLocalTitle(coverSettings.title)
    }
  }, [coverSettings?.title])

  useEffect(() => {
    if (coverSettings?.subtitle !== undefined) {
      setLocalSubtitle(coverSettings.subtitle)
    }
  }, [coverSettings?.subtitle])

  useEffect(() => {
    if (coverSettings?.overlayOpacity !== undefined) {
      setLocalOpacity(coverSettings.overlayOpacity)
    }
  }, [coverSettings?.overlayOpacity])

  const updateCoverSettings = (field: string, value: any) => {
    formValues.setValue(`cover.${field}` as any, value, { shouldDirty: true })
  }

  const handleTitleBlur = () => {
    if (localTitle !== coverSettings?.title) {
      updateCoverSettings('title', localTitle)
    }
  }

  const handleSubtitleBlur = () => {
    if (localSubtitle !== coverSettings?.subtitle) {
      updateCoverSettings('subtitle', localSubtitle)
    }
  }

  const handleOpacityChange = (value: number) => {
    setLocalOpacity(value)

    if (opacityTimeoutRef.current) {
      clearTimeout(opacityTimeoutRef.current)
    }

    opacityTimeoutRef.current = setTimeout(() => {
      updateCoverSettings('overlayOpacity', value)
    }, 300)
  }

  if (!coverSettings) return null

  return (
    <>
      {coverSettings.enabled ? (
        <div
          className="relative aspect-[21/9] overflow-hidden group"
          style={getCoverStyle()}
        >
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: localOpacity / 100 }}
          />
          <div
            className={`absolute inset-0 flex flex-col ${coverSettings.alignment === 'left' ? 'items-start justify-end text-left' : 'items-center justify-center text-center'} p-4 md:p-8`}
          >
            {coverSettings.showTitle && (
              <input
                type="text"
                value={localTitle}
                onChange={e => setLocalTitle(e.target.value)}
                onBlur={handleTitleBlur}
                className="text-xl sm:text-2xl md:text-4xl font-bold mb-2 sm:mb-4 bg-transparent border-2 border-transparent hover:border-white/50 focus:border-white focus:outline-none text-white px-3 rounded transition-colors w-full max-w-2xl"
                placeholder="Enter title..."
              />
            )}
            {coverSettings.showSubtitle && (
              <input
                type="text"
                value={localSubtitle}
                onChange={e => setLocalSubtitle(e.target.value)}
                onBlur={handleSubtitleBlur}
                className="text-base sm:text-base md:text-lg bg-transparent border-2 border-transparent hover:border-white/50 focus:border-white focus:outline-none text-white px-3 rounded transition-colors w-full max-w-2xl"
                placeholder="Enter subtitle..."
              />
            )}
          </div>
          {viewMode === 'edit' && (
            <button
              onClick={() => setCoverModalOpen(true)}
              className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all"
              title="Cover Settings"
            >
              <Icon icon="cog" className="w-5 h-5 text-gray-700" />
            </button>
          )}
        </div>
      ) : viewMode === 'edit' ? (
        <div
          onClick={() => {
            updateCoverSettings('enabled', true)
            setCoverModalOpen(true)
          }}
          className="relative h-32 sm:h-40 overflow-hidden bg-gray-200 hover:bg-gray-300 transition-colors cursor-pointer group"
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600">
            <Icon icon="image-slash" className="w-8 h-8 mb-2" />
            <p className="text-sm font-medium">Capa desativada</p>
            <p className="text-xs">Clique para ativar</p>
          </div>
        </div>
      ) : null}
      <Dialog open={coverModalOpen} onOpenChange={setCoverModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configurações da Capa</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="coverEnabled" className="text-sm font-medium">
                  Capa ativada
                </Label>
                <Switch
                  checked={coverSettings.enabled}
                  onClick={() =>
                    updateCoverSettings('enabled', !coverSettings.enabled)
                  }
                />
              </div>

              {coverSettings.enabled && (
                <>
                  <div className="pt-4 border-t space-y-3">
                    <Label className="text-sm font-medium">
                      Elementos de texto
                    </Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="showTitle" className="text-sm">
                          Mostrar título
                        </Label>
                        <Switch
                          id="showTitle"
                          checked={coverSettings.showTitle}
                          onClick={() =>
                            updateCoverSettings(
                              'showTitle',
                              !coverSettings.showTitle
                            )
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="showSubtitle" className="text-sm">
                          Mostrar subtítulo
                        </Label>
                        <Switch
                          id="showSubtitle"
                          checked={coverSettings.showSubtitle}
                          onClick={() =>
                            updateCoverSettings(
                              'showSubtitle',
                              !coverSettings.showSubtitle
                            )
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="showLogo" className="text-sm">
                          Mostrar logo Terra Viva
                        </Label>
                        <Switch
                          id="showLogo"
                          checked={coverSettings.showLogo}
                          onClick={() =>
                            updateCoverSettings(
                              'showLogo',
                              !coverSettings.showLogo
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-3">
                    <Label className="text-sm font-medium">
                      Opacidade da sobreposição
                    </Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <Slider
                          value={[localOpacity]}
                          onValueChange={([value]) =>
                            handleOpacityChange(value as any)
                          }
                          min={0}
                          max={100}
                          step={1}
                          className="flex-1"
                        />
                        <span className="text-sm font-medium w-12 text-right">
                          {localOpacity}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Ajusta a transparência da camada escura sobre a capa
                      </p>
                    </div>
                  </div>

                  {/* <div className="pt-4 border-t space-y-2">
                    <Label className="text-sm font-medium">
                      Alinhamento do texto
                    </Label>
                    <div className="flex gap-2">
                      <Button
                        variant={
                          coverSettings.alignment === 'left'
                            ? 'default'
                            : 'outline'
                        }
                        size="sm"
                        className="flex-1"
                        onClick={() => updateCoverSettings('alignment', 'left')}
                      >
                        Esquerda
                      </Button>
                      <Button
                        variant={
                          coverSettings.alignment === 'center'
                            ? 'default'
                            : 'outline'
                        }
                        size="sm"
                        className="flex-1"
                        onClick={() =>
                          updateCoverSettings('alignment', 'center')
                        }
                      >
                        Centro
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Edite o título e subtítulo diretamente na capa
                    </p>
                  </div> */}
                </>
              )}
            </div>

            {coverSettings.enabled && (
              <div className="space-y-4 pt-2 border-t">
                <Label className="text-sm font-medium">Estilo da capa</Label>

                <div className="flex gap-2">
                  <Button
                    variant={
                      coverSettings.backgroundType === 'color'
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    className="flex-1"
                    onClick={() =>
                      updateCoverSettings('backgroundType', 'color')
                    }
                  >
                    Cor
                  </Button>
                  <Button
                    variant={
                      coverSettings.backgroundType === 'image'
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    className="flex-1"
                    onClick={() =>
                      updateCoverSettings('backgroundType', 'image')
                    }
                  >
                    Imagem
                  </Button>
                </div>

                {coverSettings.backgroundType === 'color' && (
                  <div className="space-y-2">
                    <Label className="text-sm">Escolha a cor</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {colorOptions.map(color => (
                        <button
                          key={color.value}
                          className={`h-12 rounded-lg border-2 transition-all ${
                            coverSettings.backgroundColor === color.value
                              ? 'border-gray-900 scale-105'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          style={{ backgroundColor: color.value }}
                          onClick={() =>
                            updateCoverSettings('backgroundColor', color.value)
                          }
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {coverSettings.backgroundType === 'image' && (
                  <div className="space-y-2">
                    <Label className="text-sm">Imagem de Fundo</Label>
                    <ImageUpload
                      enableCrop
                      cropAspect={21 / 9}
                      slug="cover"
                      catalogId={catalogId}
                      value={coverSettings.backgroundImage}
                      onChange={url =>
                        updateCoverSettings('backgroundImage', url)
                      }
                      onRemove={() =>
                        updateCoverSettings('backgroundImage', '')
                      }
                    />
                    <p className="text-xs text-gray-500">
                      Use uma imagem de alta qualidade para melhores resultados
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
