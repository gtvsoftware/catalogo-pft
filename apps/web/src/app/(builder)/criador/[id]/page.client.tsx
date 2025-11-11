'use client'

import { useParams } from 'next/navigation'
import type { User } from 'next-auth'

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
  const { formValues, viewMode } = useCatalogBuilder()

  const availabilityEnd = formValues.watch('availabilityEnd')

  return (
    <CatalogBuilderLayout>
      <Cover />
      {availabilityEnd && <InfoBar />}
      <div className="flex flex-col py-8 px-4 md:px-8">
        <Sections />
        {viewMode !== 'preview' && <NewSectionButton />}
      </div>
    </CatalogBuilderLayout>
  )
}

interface FlowerCatalogBuilderProps {
  user: User
}

export default function FlowerCatalogBuilder({
  user
}: FlowerCatalogBuilderProps) {
  const params = useParams()
  const catalogId = params.id as string

  return (
    <CatalogBuilderProvider catalogId={catalogId} loggedUser={user}>
      <FlowerCatalogBuilderContent />
    </CatalogBuilderProvider>
  )
}
