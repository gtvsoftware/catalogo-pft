'use client'

import { ObjectId } from 'bson'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function NovoCatalogoPage() {
  const router = useRouter()

  useEffect(() => {
    // Generate a new ObjectId and redirect to the builder
    const newId = new ObjectId().toString()
    router.replace(`/criador/${newId}`)
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
        <p className="text-gray-600">Criando novo catálogo...</p>
      </div>
    </div>
  )
}
