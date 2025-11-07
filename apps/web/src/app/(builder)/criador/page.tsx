'use client'

import { CatalogBuilderLayout } from '@/features/builder/components/Layout'
import { NewSectionButton } from '@/features/builder/components/NewSectionButton'
import { Sections } from '@/features/builder/components/Sections'
import { CatalogBuilderProvider } from '@/features/builder/providers/CatalogBuilderContext'

function FlowerCatalogBuilderContent() {
  return (
    <CatalogBuilderLayout>
      <Sections />
      <NewSectionButton />
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
