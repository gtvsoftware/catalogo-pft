'use client'

import { toast } from '@terraviva/ui/sonner'
import { useParams, useRouter } from 'next/navigation'
import type { User } from 'next-auth'
import { useEffect, useState } from 'react'

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
  const router = useRouter()
  const catalogId = params.id as string
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const checkAuthorization = async () => {
      // For new catalogs, allow access
      if (catalogId === 'novo') {
        setIsAuthorized(true)
        setIsChecking(false)
        return
      }

      try {
        const response = await fetch(`/api/catalogos/${catalogId}`)

        if (response.ok) {
          const catalog = await response.json()

          // Check if the logged user is the seller of this catalog
          if (catalog.seller?.id && catalog.seller.id !== user.oid) {
            toast.error('Acesso negado', {
              description: 'Você não tem permissão para editar este catálogo.'
            })
            router.push('/')
            return
          }

          setIsAuthorized(true)
        } else if (response.status === 404) {
          // Catalog doesn't exist yet, allow creation
          setIsAuthorized(true)
        } else {
          toast.error('Erro ao carregar catálogo')
          router.push('/')
        }
      } catch (error) {
        console.error('Error checking authorization:', error)
        toast.error('Erro ao verificar permissões')
        router.push('/')
      } finally {
        setIsChecking(false)
      }
    }

    checkAuthorization()
  }, [catalogId, user.oid, router])

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return (
    <CatalogBuilderProvider catalogId={catalogId} loggedUser={user}>
      <FlowerCatalogBuilderContent />
    </CatalogBuilderProvider>
  )
}
