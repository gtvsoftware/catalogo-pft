'use client'

import { Button, IconButton } from '@terraviva/ui/button'
import { Card, CardContent } from '@terraviva/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@terraviva/ui/dropdown-menu'
import { Icon } from '@terraviva/ui/icon'
import { Input } from '@terraviva/ui/input'
import { PaginationAndPerPage } from '@terraviva/ui/pagination-and-per-page'
import { Separator } from '@terraviva/ui/separator'
import { toast } from '@terraviva/ui/sonner'
import { ObjectID } from 'bson'
import { useRouter } from 'next/navigation'
import type { User } from 'next-auth'
import { Fragment, useEffect, useState } from 'react'

import Avatar from '@/components/Avatar'

interface Catalogo {
  id: string
  slug?: string
  title: string
  cover?: {
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
  seller?: {
    name: string
    picture: string
    id: string
  }
  sharedWith?: Array<{
    id: string
    name: string | null
    picture: string | null
  }>
  phoneContact?: string
  availabilityStart?: string
  availabilityEnd?: string
  sections: Array<{ id: string; title: string; items: any[] }>
  createdAt: string
  updatedAt: string
}

export default function CatalogosListPage({ user }: { user: Partial<User> }) {
  const router = useRouter()
  const [catalogos, setCatalogos] = useState<Catalogo[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const [searchDebounce, setSearchDebounce] = useState('')
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchDebounce(search)
      setPage(1)
    }, 500)
    return () => clearTimeout(timeout)
  }, [search])

  const fetchCatalogos = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: perPage.toString(),
        sellerOid: user.oid!,
        ...(searchDebounce && { search: searchDebounce })
      })

      const response = await fetch(`/api/catalogos?${params}`)
      if (!response.ok) {
        throw new Error('Erro ao carregar catálogos')
      }

      const data = await response.json()
      setCatalogos(data.catalogos || data)
      setTotalCount(data.total || data.length)
    } catch (error) {
      toast.error('Erro ao carregar catálogos', {
        description:
          error instanceof Error ? error.message : 'Erro desconhecido'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCatalogos()
  }, [page, perPage, searchDebounce])

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        'Tem certeza que deseja excluir este catálogo? Esta ação não pode ser desfeita.'
      )
    ) {
      return
    }

    try {
      const response = await fetch(`/api/catalogos/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir catálogo')
      }

      toast.success('Catálogo excluído com sucesso')
      fetchCatalogos()
    } catch (error) {
      toast.error('Erro ao excluir catálogo', {
        description:
          error instanceof Error ? error.message : 'Erro desconhecido'
      })
    }
  }

  const handleDuplicate = async (catalogo: Catalogo) => {
    setDuplicatingId(catalogo.id)
    const toastId = toast.loading('Duplicando catálogo...', {
      description: 'Preparando dados...',
      duration: Infinity
    })

    try {
      toast.loading('Duplicando catálogo...', {
        id: toastId,
        description: 'Carregando dados do catálogo...',
        duration: Infinity
      })
      const response = await fetch(`/api/catalogos/${catalogo.id}`)
      if (!response.ok) {
        throw new Error('Erro ao carregar catálogo')
      }

      const fullCatalogo = await response.json()

      const newId = new ObjectID().toString()

      toast.loading('Duplicando catálogo...', {
        id: toastId,
        description: 'Copiando imagens...',
        duration: Infinity
      })
      const duplicateImagesResponse = await fetch('/api/catalogos/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceCatalogId: catalogo.id,
          targetCatalogId: newId
        })
      })

      if (!duplicateImagesResponse.ok) {
        throw new Error('Erro ao copiar imagens')
      }

      const { copiedCount } = await duplicateImagesResponse.json()

      const remapImageUrls = (obj: any): any => {
        if (!obj) return obj

        if (typeof obj === 'string') {
          return obj.replace(new RegExp(`/${catalogo.id}/`, 'g'), `/${newId}/`)
        }

        if (Array.isArray(obj)) {
          return obj.map(item => remapImageUrls(item))
        }

        if (typeof obj === 'object') {
          const newObj: any = {}
          for (const key in obj) {
            newObj[key] = remapImageUrls(obj[key])
          }
          return newObj
        }

        return obj
      }

      toast.loading('Duplicando catálogo...', {
        id: toastId,
        description: 'Atualizando referências de imagens...',
        duration: Infinity
      })
      const remappedSections = remapImageUrls(fullCatalogo.sections)

      toast.loading('Duplicando catálogo...', {
        id: toastId,
        description: 'Criando catálogo duplicado...',
        duration: Infinity
      })
      const newCatalogo = {
        ...fullCatalogo,
        sections: remappedSections,
        slug: undefined,
        title: `${fullCatalogo.title} (Cópia)`,
        seller: {
          id: user.oid,
          name: user.name,
          picture: user.picture
        },
        sharedWith: []
      }

      const createResponse = await fetch(`/api/catalogos/${newId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCatalogo)
      })

      if (!createResponse.ok) {
        throw new Error('Erro ao duplicar catálogo')
      }

      const created = await createResponse.json()
      toast.success(
        `Catálogo duplicado com sucesso${copiedCount > 0 ? ` (${copiedCount} imagens copiadas)` : ''}`,
        { id: toastId }
      )
      router.push(`/criador/${created.id}`)
    } catch (error) {
      toast.error('Erro ao duplicar catálogo', {
        id: toastId,
        description:
          error instanceof Error ? error.message : 'Erro desconhecido'
      })
      setDuplicatingId(null)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copiado!`)
  }

  const handleCopyLink = (catalogo: Catalogo) => {
    const baseUrl = window.location.origin
    const linkById = `${baseUrl}/visualizar/${catalogo.id}`

    if (!catalogo.slug) {
      copyToClipboard(linkById, 'Link')
    }
  }

  const isOwner = (catalogo: Catalogo) => {
    return catalogo.seller?.id === user.oid
  }

  const totalPages = Math.ceil(totalCount / perPage)

  return (
    <div className="container mx-auto py-4 md:py-8 px-1">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Catálogos
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Gerencie os catálogos personalizados
            </p>
          </div>
          <Button
            leftIcon="plus"
            onClick={() => router.push('/criador/novo')}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            Novo Catálogo
          </Button>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Icon
              icon="magnifying-glass"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Buscar catálogos..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
            </div>
          ) : catalogos.length === 0 ? (
            <div className="text-center py-12">
              <Icon
                icon="book"
                className="mx-auto h-12 w-12 text-muted-foreground mb-4"
              />
              <p className="text-muted-foreground">
                {searchDebounce
                  ? 'Nenhum catálogo encontrado'
                  : 'Nenhum catálogo criado ainda'}
              </p>
            </div>
          ) : (
            <div>
              <div className="space-y-4 md:hidden">
                {catalogos.map((catalogo, index) => (
                  <Fragment key={catalogo.id}>
                    <Card
                      key={catalogo.id}
                      className="overflow-hidden border-none rounded-none shadow-none transition-shadow py-2 px-0"
                    >
                      <CardContent className="p-0 space-y-3">
                        <div className="space-y-2">
                          <h3 className="font-medium text-base line-clamp-1">
                            {catalogo?.title?.length > 0
                              ? catalogo.title
                              : 'Sem título'}
                          </h3>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            {/* {catalogo.seller?.name && (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage
                                  style={{ objectFit: 'cover' }}
                                  src={
                                    catalogo.seller.picture
                                      ? `https://megtv2.blob.core.windows.net/public/avatars/${catalogo.seller.picture}`
                                      : undefined
                                  }
                                  alt={catalogo.seller.name}
                                />
                                <AvatarFallback className="bg-blue-100 text-blue-700 font-medium text-xs">
                                  {catalogo.seller.name
                                    .split(' ')
                                    .map(n => n[0])
                                    .join('')
                                    .toUpperCase()
                                    .slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <span>{catalogo.seller.name}</span>
                            </div>
                          )} */}
                            {(catalogo.availabilityStart ||
                              catalogo.availabilityEnd) && (
                              <div className="flex items-center gap-2">
                                <Icon icon="calendar" className="h-4 w-4" />
                                <span>
                                  {catalogo.availabilityStart &&
                                    formatDate(catalogo.availabilityStart)}
                                  {catalogo.availabilityStart &&
                                    catalogo.availabilityEnd &&
                                    ' - '}
                                  {catalogo.availabilityEnd &&
                                    formatDate(catalogo.availabilityEnd)}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-xs">
                              <Icon
                                variant="light"
                                icon="clock"
                                className="h-4 w-4"
                              />
                              <span>
                                Criado em{' '}
                                {new Date(
                                  catalogo.createdAt
                                ).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          {/* View Button - Everyone */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.open(
                                `/visualizar/${catalogo.id}`,
                                '_blank'
                              )
                            }
                            className="flex-1"
                            leftIcon="eye"
                          >
                            Ver
                          </Button>

                          {/* Owner-only: Edit */}
                          {isOwner(catalogo) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                router.push(`/criador/${catalogo.id}`)
                              }
                              className="flex-1"
                              leftIcon="pencil"
                            >
                              Editar
                            </Button>
                          )}

                          {/* Duplicate - Everyone */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDuplicate(catalogo)}
                            className="flex-1"
                            leftIcon={
                              duplicatingId === catalogo.id ? 'spinner' : 'copy'
                            }
                            disabled={duplicatingId === catalogo.id}
                          >
                            {duplicatingId === catalogo.id
                              ? 'Duplicando...'
                              : 'Duplicar'}
                          </Button>

                          {/* Actions Menu - Link & Delete */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <IconButton
                                variant="outline"
                                size="sm"
                                icon="ellipsis-vertical"
                              />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {/* Copy Link options */}
                              {catalogo.slug ? (
                                <>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      copyToClipboard(
                                        `${window.location.origin}/visualizar/${catalogo.id}`,
                                        'Link por ID'
                                      )
                                    }
                                  >
                                    <Icon
                                      icon="link"
                                      className="mr-2 h-4 w-4"
                                    />
                                    Copiar link por ID
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      copyToClipboard(
                                        `${window.location.origin}/visualizar/${catalogo.slug}`,
                                        'Link por Slug'
                                      )
                                    }
                                  >
                                    <Icon
                                      icon="link"
                                      className="mr-2 h-4 w-4"
                                    />
                                    Copiar link por Slug
                                  </DropdownMenuItem>
                                </>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => handleCopyLink(catalogo)}
                                >
                                  <Icon icon="link" className="mr-2 h-4 w-4" />
                                  Copiar link
                                </DropdownMenuItem>
                              )}

                              {/* Delete - Owner only */}
                              {isOwner(catalogo) && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(catalogo.id)}
                                    className="text-red-600 focus:text-red-700"
                                  >
                                    <Icon
                                      icon="trash"
                                      className="mr-2 h-4 w-4"
                                    />
                                    Excluir
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                    {index < catalogos.length - 1 && <Separator />}
                  </Fragment>
                ))}
              </div>

              <div className="hidden md:block border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-semibold text-sm">
                        Título
                      </th>
                      <th className="text-left p-4 font-semibold text-sm">
                        Vendedor
                      </th>
                      <th className="text-left p-4 font-semibold text-sm">
                        Disponibilidade
                      </th>
                      <th className="text-left p-4 font-semibold text-sm">
                        Criado em
                      </th>
                      <th className="text-right p-4 font-semibold text-sm">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {catalogos.map(catalogo => (
                      <tr
                        key={catalogo.id}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <td className="p-4 font-medium text-sm">
                          {catalogo?.title?.length > 0
                            ? catalogo.title
                            : 'Sem título'}
                        </td>
                        <td className="p-4 text-muted-foreground text-sm">
                          {catalogo.seller?.name ? (
                            <div className="flex items-center gap-2">
                              <Avatar image={catalogo.seller.picture} />
                              <span>{catalogo.seller.name}</span>
                            </div>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="p-4 text-muted-foreground text-sm">
                          {catalogo.availabilityStart ||
                          catalogo.availabilityEnd ? (
                            <>
                              {catalogo.availabilityStart &&
                                formatDate(catalogo.availabilityStart)}
                              {catalogo.availabilityStart &&
                                catalogo.availabilityEnd &&
                                ' - '}
                              {catalogo.availabilityEnd &&
                                formatDate(catalogo.availabilityEnd)}
                            </>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="p-4 text-muted-foreground text-sm">
                          {new Date(catalogo.createdAt).toLocaleDateString(
                            'pt-BR'
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-1">
                            {/* View Button - Everyone */}
                            <IconButton
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                window.open(
                                  `/visualizar/${catalogo.id}`,
                                  '_blank'
                                )
                              }
                              title="Visualizar"
                              icon="eye"
                            />

                            {/* Owner-only: Edit & Delete */}
                            {isOwner(catalogo) && (
                              <>
                                <IconButton
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    router.push(`/criador/${catalogo.id}`)
                                  }
                                  title="Editar"
                                  icon="pencil"
                                />

                                <IconButton
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(catalogo.id)}
                                  title="Excluir"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  icon="trash"
                                />
                              </>
                            )}

                            {/* Duplicate - Everyone */}
                            <IconButton
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDuplicate(catalogo)}
                              title="Duplicar"
                              icon={
                                duplicatingId === catalogo.id
                                  ? 'spinner'
                                  : 'copy'
                              }
                              disabled={duplicatingId === catalogo.id}
                              className={
                                duplicatingId === catalogo.id
                                  ? 'animate-spin'
                                  : ''
                              }
                            />

                            {/* Copy Link - Everyone (ID always exists, Slug optional) */}
                            {catalogo.slug ? (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <IconButton
                                    variant="ghost"
                                    size="sm"
                                    icon="link"
                                    title="Copiar link"
                                  />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      copyToClipboard(
                                        `${window.location.origin}/visualizar/${catalogo.id}`,
                                        'Link por ID'
                                      )
                                    }
                                  >
                                    <Icon
                                      icon="copy"
                                      className="mr-2 h-4 w-4"
                                    />
                                    Copiar link por ID
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      copyToClipboard(
                                        `${window.location.origin}/visualizar/${catalogo.slug}`,
                                        'Link por Slug'
                                      )
                                    }
                                  >
                                    <Icon
                                      icon="copy"
                                      className="mr-2 h-4 w-4"
                                    />
                                    Copiar link por Slug
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            ) : (
                              <IconButton
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyLink(catalogo)}
                                title="Copiar link"
                                icon="link"
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {totalPages > 1 && (
            <div className="pt-4">
              <PaginationAndPerPage
                page={page}
                totalPages={totalPages}
                perPage={perPage}
                onPageChange={setPage}
                onPerPageChange={setPerPage}
                perPageOptions={[6, 12, 24, 48]}
                isDisabled={loading}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
