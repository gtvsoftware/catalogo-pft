'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@terraviva/ui/badge'
import { Button } from '@terraviva/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@terraviva/ui/card'
import { DataTable, HeaderColumnSorting } from '@terraviva/ui/data-table'
import { Icon } from '@terraviva/ui/icon'
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
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [globalFilter, setGlobalFilter] = useState('')

  const fetchCatalogos = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: (pageIndex + 1).toString(),
        limit: pageSize.toString(),
        ...(globalFilter && { search: globalFilter })
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
  }, [pageIndex, pageSize, globalFilter])

  const columns: ColumnDef<Catalogo>[] = [
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <HeaderColumnSorting column={column} content="Título" />
      ),
      cell: ({ row }) => {
        const title = row.getValue('title') as string
        return <div className="font-medium">{title}</div>
      }
    },
    {
      accessorKey: 'sellerName',
      header: 'Vendedor',
      cell: ({ row }) => {
        const sellerName = row.getValue('sellerName') as string | undefined
        return <div className="text-muted-foreground">{sellerName || '—'}</div>
      }
    },
    {
      accessorKey: 'availabilityStart',
      header: 'Disponibilidade',
      cell: ({ row }) => {
        const start = row.original.availabilityStart
        const end = row.original.availabilityEnd
        if (!start && !end)
          return <span className="text-muted-foreground">—</span>

        const formatDate = (dateStr: string) => {
          return new Date(dateStr).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })
        }

        return (
          <div className="text-sm text-muted-foreground">
            {start && formatDate(start)}
            {start && end && ' - '}
            {end && formatDate(end)}
          </div>
        )
      }
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <HeaderColumnSorting column={column} content="Criado em" />
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue('createdAt') as string)
        return (
          <div className="text-muted-foreground text-sm">
            {date.toLocaleDateString('pt-BR')}
          </div>
        )
      }
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => {
        const handleDelete = async () => {
          if (
            !window.confirm(
              'Tem certeza que deseja excluir este catálogo? Esta ação não pode ser desfeita.'
            )
          ) {
            return
          }

          try {
            const response = await fetch(`/api/catalogos/${row.original.id}`, {
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

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/criador/${row.original.id}`)}
              title="Editar"
            >
              <Icon icon="pencil" className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/visualizar/${row.original.id}`)}
              title="Visualizar"
            >
              <Icon icon="eye" className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              title="Excluir"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Icon icon="trash" className="h-4 w-4" />
            </Button>
          </div>
        )
      }
    }
  ]

  const pageCount = Math.ceil(totalCount / pageSize)

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="book" className="text-primary-500" />
            Catálogos Criados
          </CardTitle>
          <CardDescription>
            Gerencie os catálogos personalizados de produtos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={catalogos}
            columns={columns}
            totalCount={totalCount}
            pageIndexValue={pageIndex}
            pageSizeValue={pageSize}
            pageCountValue={pageCount}
            globalFilterValue={globalFilter}
            hideColumnsButton
            isLoading={loading}
            manualPagination={true}
            manualFiltering={true}
            manualSorting={false}
            onPageIndexChange={setPageIndex}
            onPageSizeChange={setPageSize}
            onGlobalFilterChange={setGlobalFilter}
            pageSizeOptions={[5, 10, 20, 50, 100]}
          />
        </CardContent>
      </Card>
    </div>
  )
}
