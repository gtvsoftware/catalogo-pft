'use client'

import { ObjectId } from 'bson'
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'
import { FormProvider, UseFormReturn, useForm } from 'react-hook-form'

import { useAutoSave } from '../hooks/useAutoSave'

export type CoverSettings = {
  enabled: boolean
  title: string
  subtitle: string
  showTitle: boolean
  showSubtitle: boolean
  showLogo: boolean
  backgroundType: 'color' | 'image'
  backgroundColor: string
  backgroundImage: string
  alignment: 'center' | 'left'
}

export type ViewMode = 'edit' | 'preview'

export type CatalogBuilderContextType = {
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  activeTab: string
  setActiveTab: (tab: string) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  coverModalOpen: boolean
  setCoverModalOpen: (open: boolean) => void

  formValues: UseFormReturn<catalogoFormType>

  isSaving: boolean
  lastSaved: Date | null

  formatDateRange: () => string
  getCoverStyle: () => React.CSSProperties
}

const CatalogBuilderContext = createContext<
  CatalogBuilderContextType | undefined
>(undefined)

export function CatalogBuilderProvider({
  children,
  catalogId
}: {
  children: React.ReactNode
  catalogId: string
}) {
  const [viewMode, setViewMode] = useState<ViewMode>('edit')
  const [activeTab, setActiveTab] = useState('info')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [coverModalOpen, setCoverModalOpen] = useState(false)
  const [_, setIsLoading] = useState(true)
  const [enableAutoSave, setEnableAutoSave] = useState(false)

  const formValues = useForm<catalogoFormType>({
    defaultValues: {
      id: catalogId,
      slug: '',
      title: '',
      sellerName: '',
      phoneContact: '',
      availabilityStart: '',
      availabilityEnd: '',
      cover: {
        enabled: true,
        title: 'Título',
        subtitle: 'Subtítulo',
        showTitle: true,
        showSubtitle: true,
        showLogo: true,
        backgroundType: 'color',
        backgroundColor: '#4a9e2d',
        backgroundImage: '',
        alignment: 'left',
        overlayOpacity: 30
      },
      sections: [
        {
          id: new ObjectId().toString(),
          title: `Seção 1`,
          items: []
        }
      ]
    }
  })

  // Load existing catalog if it exists
  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const response = await fetch(`/api/catalogos/${catalogId}`)

        if (response.ok) {
          const catalog = await response.json()
          // Reset form with loaded data
          formValues.reset({
            id: catalog.id,
            slug: catalog.slug || '',
            title: catalog.title || '',
            sellerName: catalog.sellerName || '',
            phoneContact: catalog.phoneContact || '',
            availabilityStart: catalog.availabilityStart || '',
            availabilityEnd: catalog.availabilityEnd || '',
            cover: catalog.cover || formValues.getValues().cover,
            sections: catalog.sections || formValues.getValues().sections
          })
        }
        // If catalog doesn't exist (404), keep default values
      } catch (error) {
        console.error('Error loading catalog:', error)
      } finally {
        setIsLoading(false)
        // Enable auto-save after a short delay to avoid triggering on initial load
        setTimeout(() => {
          setEnableAutoSave(true)
        }, 100)
      }
    }

    loadCatalog()
  }, [catalogId])

  const saveCatalog = async () => {
    const formData = formValues.getValues()
    const catalogId = formData.id

    const payload = {
      slug: formData.slug,
      title: formData.title,
      cover: formData.cover,
      sellerName: formData.sellerName,
      phoneContact: formData.phoneContact,
      availabilityStart: formData.availabilityStart,
      availabilityEnd: formData.availabilityEnd,
      sections: formData.sections
    }

    const response = await fetch(`/api/catalogos/${catalogId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error('Failed to save catalog')
    }

    return response.json()
  }

  const { isSaving, lastSaved, triggerSave } = useAutoSave({
    delay: 2000,
    onSave: saveCatalog,
    enabled: enableAutoSave // Only enable after initial load completes
  })

  const skipSaveCountRef = useRef(0)

  useEffect(() => {
    if (!enableAutoSave) return // Don't subscribe until auto-save is enabled

    const subscription = formValues.watch(() => {
      if (skipSaveCountRef.current > 0) {
        skipSaveCountRef.current--
        return
      }
      triggerSave()
    })
    return () => subscription.unsubscribe()
  }, [formValues, triggerSave, enableAutoSave])

  // When viewMode changes, skip the next few save triggers
  const prevViewModeRef = useRef(viewMode)
  useEffect(() => {
    if (enableAutoSave && prevViewModeRef.current !== viewMode) {
      skipSaveCountRef.current = 3 // Skip next 3 watch triggers
      prevViewModeRef.current = viewMode
    }
  }, [viewMode, enableAutoSave])

  const formatDateRange = () => {
    const formData = formValues.getValues()
    if (!formData.availabilityStart && !formData.availabilityEnd) {
      return ''
    }

    const start = formData.availabilityStart
      ? new Date(formData.availabilityStart).toLocaleDateString()
      : 'N/A'
    const end = formData.availabilityEnd
      ? new Date(formData.availabilityEnd).toLocaleDateString()
      : 'N/A'

    return `${start} - ${end}`
  }

  const getCoverStyle = (): React.CSSProperties => {
    const cover = formValues.getValues('cover')
    if (!cover) return {}

    if (cover.backgroundType === 'image' && cover.backgroundImage) {
      return {
        backgroundImage: `url(${cover.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    }
    return {
      backgroundColor: cover.backgroundColor
    }
  }

  const value: CatalogBuilderContextType = {
    viewMode,
    setViewMode,
    activeTab,
    setActiveTab,
    sidebarOpen,
    setSidebarOpen,
    coverModalOpen,
    setCoverModalOpen,
    formValues,
    isSaving,
    lastSaved,
    formatDateRange,
    getCoverStyle
  }

  return (
    <CatalogBuilderContext.Provider value={value}>
      <FormProvider {...formValues}>{children}</FormProvider>
    </CatalogBuilderContext.Provider>
  )
}

export function useCatalogBuilder() {
  const context = useContext(CatalogBuilderContext)
  if (context === undefined) {
    throw new Error(
      'useCatalogBuilder must be used within a CatalogBuilderProvider'
    )
  }
  return context
}
