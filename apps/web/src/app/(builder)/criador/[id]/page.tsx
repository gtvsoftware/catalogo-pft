'use client'

import { useParams } from 'next/navigation'

import { Cover } from '@/features/builder/components/Cover'
import { InfoBar } from '@/features/builder/components/InfoBar'
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
      <Cover />
      <InfoBar />
      <div className="flex flex-col px-8 py-8">
        <Sections />
        {viewMode !== 'preview' && <NewSectionButton />}
      </div>
    </CatalogBuilderLayout>
  )
}

export default function FlowerCatalogBuilder() {
  const params = useParams()
  const catalogId = params.id as string

  return (
    <CatalogBuilderProvider catalogId={catalogId}>
      <FlowerCatalogBuilderContent />
    </CatalogBuilderProvider>
  )
}
