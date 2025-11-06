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

interface Grupo {
  id: string
  nome: string
  slug: string
  tipoProduto: string
  status: string
  descricao: string
  imagem?: string
  createdAt: string
  updatedAt: string
}

export default function GruposListPage() {
  const router = useRouter()
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [globalFilter, setGlobalFilter] = useState('')

  const fetchGrupos = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: (pageIndex + 1).toString(),
        limit: pageSize.toString(),
        ...(globalFilter && { search: globalFilter })
      })

      const response = await fetch(`/api/grupos?${params}`)
      if (!response.ok) {
        throw new Error('Erro ao carregar grupos')
      }

      const data = await response.json()
      setGrupos(data.grupos || data)
      setTotalCount(data.total || data.length)
    } catch (error) {
      toast.error('Erro ao carregar grupos', {
        description:
          error instanceof Error ? error.message : 'Erro desconhecido'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGrupos()
  }, [pageIndex, pageSize, globalFilter])

  const columns: ColumnDef<Grupo>[] = [
    {
      accessorKey: 'imagem',
      header: 'Imagem',
      cell: ({ row }) => {
        const imagem = row.getValue('imagem') as string | undefined
        return (
          <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex items-center justify-center">
            {imagem ? (
              <img
                src={imagem}
                alt={row.getValue('nome')}
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
      accessorKey: 'nome',
      header: ({ column }) => (
        <HeaderColumnSorting column={column} content="Nome" />
      ),
      cell: ({ row }) => {
        const nome = row.getValue('nome') as string
        return <div className="font-medium">{nome}</div>
      }
    },
    {
      accessorKey: 'slug',
      header: ({ column }) => (
        <HeaderColumnSorting column={column} content="Slug" />
      ),
      cell: ({ row }) => {
        const slug = row.getValue('slug') as string
        return (
          <div className="text-muted-foreground font-mono text-sm">{slug}</div>
        )
      }
    },
    {
      accessorKey: 'tipoProduto',
      header: ({ column }) => (
        <HeaderColumnSorting column={column} content="Tipo" />
      ),
      cell: ({ row }) => {
        const tipo = row.getValue('tipoProduto') as string
        return (
          <Badge variant={tipo === 'FLOR' ? 'default' : 'secondary'}>
            {tipo === 'FLOR' ? (
              <Icon icon="flower" className="mr-1 h-3 w-3" />
            ) : (
              <Icon icon="leaf" className="mr-1 h-3 w-3" />
            )}
            {tipo}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <HeaderColumnSorting column={column} content="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        return (
          <Badge variant={status === 'ATIVO' ? 'default' : 'destructive'}>
            {status}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'descricao',
      header: 'Descrição',
      cell: ({ row }) => {
        const descricao = row.getValue('descricao') as string
        return (
          <div className="max-w-md truncate text-muted-foreground">
            {descricao}
          </div>
        )
      }
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => {
        return (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                router.push(`/cadastros/grupos/${row.original.id}`)
              }
            >
              <Icon icon="pencil" className="h-4 w-4" />
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Icon icon="flower" className="text-primary-500" />
                Grupos de Produtos
              </CardTitle>
              <CardDescription>
                Gerencie os grupos de flores e plantas
              </CardDescription>
            </div>
            <Button onClick={() => router.push('/cadastros/grupos/novo')}>
              <Icon icon="plus" className="mr-2" />
              Novo Grupo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={grupos}
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
