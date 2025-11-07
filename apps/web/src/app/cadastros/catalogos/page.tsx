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
  title: string
  caption?: string
  banner?: string
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
      accessorKey: 'banner',
      header: 'Banner',
      cell: ({ row }) => {
        const banner = row.getValue('banner') as string | undefined
        return (
          <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex items-center justify-center">
            {banner ? (
              <img
                src={banner}
                alt={row.getValue('title')}
                className="w-full h-full object-cover"
              />
            ) : (
              <Icon icon="image" className="text-muted-foreground" />
            )}
          </div>
        )
      }
    },
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
      accessorKey: 'caption',
      header: 'Descrição',
      cell: ({ row }) => {
        const caption = row.getValue('caption') as string | undefined
        return (
          <div className="max-w-md truncate text-muted-foreground">
            {caption || '—'}
          </div>
        )
      }
    },
    {
      accessorKey: 'sections',
      header: 'Seções',
      cell: ({ row }) => {
        const sections = row.getValue('sections') as Catalogo['sections']
        return (
          <Badge variant="secondary">
            {sections?.length || 0} seção
            {sections?.length === 1 ? '' : 's'}
          </Badge>
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
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              router.push(`/cadastros/catalogos/${row.original.id}`)
            }
          >
            <Icon icon="pencil" className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              const confirmed = confirm('Deseja excluir este catálogo?')
              if (!confirmed) return
              try {
                const response = await fetch(
                  `/api/catalogos/${row.original.id}`,
                  {
                    method: 'DELETE'
                  }
                )
                if (!response.ok) throw new Error('Erro ao excluir catálogo')
                toast.success('Catálogo excluído com sucesso')
                fetchCatalogos()
              } catch (err) {
                toast.error('Erro ao excluir catálogo', {
                  description:
                    err instanceof Error ? err.message : 'Erro desconhecido'
                })
              }
            }}
          >
            <Icon icon="trash" className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      )
    }
  ]

  const pageCount = Math.ceil(totalCount / pageSize)

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Icon icon="book" className="text-primary-500" />
                Catálogos Criados
              </CardTitle>
              <CardDescription>
                Gerencie os catálogos personalizados de produtos
              </CardDescription>
            </div>
            <Button
              leftIcon="plus"
              onClick={() => router.push('/cadastros/catalogos/novo')}
            >
              Novo Catálogo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            hideColumnsButton
            data={catalogos}
            columns={columns}
            totalCount={totalCount}
            pageIndexValue={pageIndex}
            pageSizeValue={pageSize}
            pageCountValue={pageCount}
            globalFilterValue={globalFilter}
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
