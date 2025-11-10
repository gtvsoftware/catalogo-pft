'use client'

import { Button, IconButton } from '@terraviva/ui/button'
import { Card, CardContent } from '@terraviva/ui/card'
import { Icon } from '@terraviva/ui/icon'
import { Input } from '@terraviva/ui/input'
import { PaginationAndPerPage } from '@terraviva/ui/pagination-and-per-page'
import { toast } from '@terraviva/ui/sonner'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Catalogo {
  id: string
  slug?: string
  title: string
  banner?: string
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
  sellerName?: string
  phoneContact?: string
  availabilityStart?: string
  availabilityEnd?: string
  sections: Array<{ id: string; title: string; items: any[] }>
  createdAt: string
  updatedAt: string
}

export default function CatalogosListPage() {
  const router = useRouter()
  const [catalogos, setCatalogos] = useState<Catalogo[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const [searchDebounce, setSearchDebounce] = useState('')

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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const totalPages = Math.ceil(totalCount / perPage)

  return (
    <div className="container mx-auto py-4 md:py-8 px-4">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Icon icon="book" className="text-primary-500" />
              Catálogos Criados
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Gerencie os catálogos personalizados de produtos
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
                {catalogos.map(catalogo => (
                  <Card
                    key={catalogo.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg line-clamp-1">
                          {catalogo?.title?.length > 0
                            ? catalogo.title
                            : 'Sem título'}
                        </h3>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          {catalogo.sellerName && (
                            <div className="flex items-center gap-2">
                              <Icon icon="user" className="h-4 w-4" />
                              <span>{catalogo.sellerName}</span>
                            </div>
                          )}
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
                          <div className="flex items-center gap-2">
                            <Icon icon="clock" className="h-4 w-4" />
                            <span>
                              Criado em{' '}
                              {new Date(catalogo.createdAt).toLocaleDateString(
                                'pt-BR'
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/criador/${catalogo.id}`)}
                          className="flex-1"
                          leftIcon="pencil"
                        >
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(`/visualizar/${catalogo.id}`)
                          }
                          className="flex-1"
                          leftIcon="eye"
                        >
                          Ver
                        </Button>
                        <IconButton
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(catalogo.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          icon="trash"
                        />
                      </div>
                    </CardContent>
                  </Card>
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
                        <td className="p-4 font-medium">
                          {catalogo?.title?.length > 0
                            ? catalogo.title
                            : 'Sem título'}
                        </td>
                        <td className="p-4 text-muted-foreground text-sm">
                          {catalogo.sellerName || '—'}
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
                              onClick={() =>
                                router.push(`/visualizar/${catalogo.id}`)
                              }
                              title="Visualizar"
                              icon="eye"
                            />
                            <IconButton
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(catalogo.id)}
                              title="Excluir"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              icon="trash"
                            />
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
