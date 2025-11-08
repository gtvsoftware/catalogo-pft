'use client'

import { CatalogBuilderLayout } from '@/features/builder/components/Layout'
import { NewSectionButton } from '@/features/builder/components/NewSectionButton'
import { Sections } from '@/features/builder/components/Sections'
import {
  CatalogBuilderProvider,
  useCatalogBuilder
} from '@/features/builder/providers/CatalogBuilderContext'

function FlowerCatalogBuilderContent() {
  const { viewMode } = useCatalogBuilder()

  return (
    <CatalogBuilderLayout>
      <Sections />
      {viewMode !== 'preview' && <NewSectionButton />}
    </CatalogBuilderLayout>
  )
}

export default function FlowerCatalogBuilder() {
  return (
    <CatalogBuilderProvider>
      <FlowerCatalogBuilderContent />
    </CatalogBuilderProvider>
  )
}
