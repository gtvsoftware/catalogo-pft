'use client'

import React, { createContext, useContext, useState } from 'react'
import { UseFormReturn, useForm } from 'react-hook-form'
import { v4 as randomUUID } from 'uuid'

// Types
export type CatalogInfo = {
  catalogName: string
  vendorName: string
  phoneContact: string
  availabilityStart: string
  availabilityEnd: string
}

export type CoverSettings = {
  enabled: boolean
  title: string
  subtitle: string
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

  // Cover Settings State
  coverSettings: CoverSettings
  updateCoverSettings: (field: keyof CoverSettings, value: any) => void

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
    catalogName: 'Spring Collection 2025',
    vendorName: '',
    phoneContact: '',
    availabilityStart: '',
    availabilityEnd: ''
  })

  // Cover Settings State
  const [coverSettings, setCoverSettings] = useState<CoverSettings>({
    enabled: true,
    title: 'Beautiful Flowers',
    subtitle: 'Fresh blooms delivered daily',
    backgroundType: 'color',
    backgroundColor: '#ec4899',
    backgroundImage: '',
    alignment: 'center'
  })

  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>('edit')
  const [activeTab, setActiveTab] = useState('info')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [coverModalOpen, setCoverModalOpen] = useState(false)

  // Form State
  const formValues = useForm<catalogoFormType>({
    defaultValues: {
      id: randomUUID(),
      title: 'Título',
      caption: 'Subtítulo',
      sections: []
    }
  })

  // Update Functions
  const updateCatalogInfo = (field: keyof CatalogInfo, value: string) => {
    setCatalogInfo(prev => ({ ...prev, [field]: value }))
  }

  const updateCoverSettings = (field: keyof CoverSettings, value: any) => {
    setCoverSettings(prev => ({ ...prev, [field]: value }))
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
    if (
      coverSettings.backgroundType === 'image' &&
      coverSettings.backgroundImage
    ) {
      return {
        backgroundImage: `url(${coverSettings.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    }
    return {
      backgroundColor: coverSettings.backgroundColor
    }
  }

  const value: CatalogBuilderContextType = {
    catalogInfo,
    updateCatalogInfo,
    coverSettings,
    updateCoverSettings,
    viewMode,
    setViewMode,
    activeTab,
    setActiveTab,
    sidebarOpen,
    setSidebarOpen,
    coverModalOpen,
    setCoverModalOpen,
    formValues,
    formatDateRange,
    getCoverStyle
  }

  return (
    <CatalogBuilderContext.Provider value={value}>
      {children}
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
