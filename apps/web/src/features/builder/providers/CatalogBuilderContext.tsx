'use client'

import { ObjectId } from 'bson'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { FormProvider, UseFormReturn, useForm } from 'react-hook-form'

import { useAutoSave } from '../hooks/useAutoSave'

// Types
export type CatalogInfo = {
  catalogName: string
  slug: string
  sellerName: string
  phoneContact: string
  availabilityStart: string
  availabilityEnd: string
}

export type CoverSettings = {
  enabled: boolean
  title: string
  subtitle: string
  showTitle: boolean
  showSubtitle: boolean
  backgroundType: 'color' | 'image'
  backgroundColor: string
  backgroundImage: string
  alignment: 'center' | 'left'
}

export type ViewMode = 'edit' | 'preview'

export type CatalogBuilderContextType = {
  // Catalog Info State
  catalogInfo: CatalogInfo
  updateCatalogInfo: (field: keyof CatalogInfo, value: string) => void

  // UI State
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  activeTab: string
  setActiveTab: (tab: string) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  coverModalOpen: boolean
  setCoverModalOpen: (open: boolean) => void

  // Form
  formValues: UseFormReturn<catalogoFormType>

  // Auto-save
  isSaving: boolean
  lastSaved: Date | null

  // Utility Functions
  formatDateRange: () => string
  getCoverStyle: () => React.CSSProperties
}

const CatalogBuilderContext = createContext<
  CatalogBuilderContextType | undefined
>(undefined)

// Provider Component
export function CatalogBuilderProvider({
  children
}: {
  children: React.ReactNode
}) {
  // Catalog Info State
  const [catalogInfo, setCatalogInfo] = useState<CatalogInfo>({
    catalogName: '',
    slug: '',
    sellerName: '',
    phoneContact: '',
    availabilityStart: '',
    availabilityEnd: ''
  })

  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>('edit')
  const [activeTab, setActiveTab] = useState('info')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [coverModalOpen, setCoverModalOpen] = useState(false)

  // Form State
  const formValues = useForm<catalogoFormType>({
    defaultValues: {
      id: new ObjectId().toString(),
      title: 'Título',
      caption: 'Subtítulo',
      cover: {
        enabled: true,
        title: 'Título',
        subtitle: 'Subtítulo',
        showTitle: true,
        showSubtitle: true,
        backgroundType: 'color',
        backgroundColor: '#4a9e2d',
        backgroundImage: '',
        alignment: 'left'
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

  // Auto-save functionality
  const saveCatalog = async () => {
    const formData = formValues.getValues()
    const catalogId = formData.id

    const payload = {
      slug: catalogInfo.slug,
      title: formData.title,
      caption: formData.caption,
      cover: formData.cover,
      sellerName: catalogInfo.sellerName,
      phoneContact: catalogInfo.phoneContact,
      availabilityStart: catalogInfo.availabilityStart,
      availabilityEnd: catalogInfo.availabilityEnd,
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
    enabled: true
  })

  // Watch form changes and trigger auto-save
  useEffect(() => {
    const subscription = formValues.watch(() => {
      triggerSave()
    })
    return () => subscription.unsubscribe()
  }, [formValues, triggerSave])

  // Watch catalogInfo changes and trigger auto-save
  useEffect(() => {
    triggerSave()
  }, [catalogInfo, triggerSave])

  // Update Functions
  const updateCatalogInfo = (field: keyof CatalogInfo, value: string) => {
    setCatalogInfo(prev => ({ ...prev, [field]: value }))
  }

  // Utility Functions
  const formatDateRange = () => {
    if (!catalogInfo.availabilityStart && !catalogInfo.availabilityEnd) {
      return ''
    }

    const start = catalogInfo.availabilityStart
      ? new Date(catalogInfo.availabilityStart).toLocaleDateString()
      : 'N/A'
    const end = catalogInfo.availabilityEnd
      ? new Date(catalogInfo.availabilityEnd).toLocaleDateString()
      : 'N/A'

    return `${start} - ${end}`
  }

  const getCoverStyle = (): React.CSSProperties => {
    const cover = formValues.watch('cover')
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
    catalogInfo,
    updateCatalogInfo,
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

// Hook to use the context
export function useCatalogBuilder() {
  const context = useContext(CatalogBuilderContext)
  if (context === undefined) {
    throw new Error(
      'useCatalogBuilder must be used within a CatalogBuilderProvider'
    )
  }
  return context
}
