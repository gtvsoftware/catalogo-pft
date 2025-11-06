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

interface Variacao {
  id: string
  variacaoId: string
  grupoId: string
  serieId: string
  grupoSlug: string
  serieSlug: string
  descricaoComercial: string
  descricaoCompleta: string
  codigoVeiling: string
  cor?: string
  tingida: boolean
  numeroPote?: string
  alturaCm?: string
  precoVendaSugerido: number
  imagens: string[]
  ativo: boolean
  createdAt: string
  updatedAt: string
  grupo: {
    nome: string
  }
  serie: {
    nome: string
  }
}

export default function VariacoesListPage() {
  const router = useRouter()
  const [variacoes, setVariacoes] = useState<Variacao[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [globalFilter, setGlobalFilter] = useState('')

  const fetchVariacoes = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: (pageIndex + 1).toString(),
        limit: pageSize.toString(),
        ...(globalFilter && { search: globalFilter })
      })

      const response = await fetch(`/api/variacoes?${params}`)
      if (!response.ok) {
        throw new Error('Erro ao carregar variações')
      }

      const data = await response.json()
      setVariacoes(data.variacoes || data)
      setTotalCount(data.total || data.length)
    } catch (error) {
      toast.error('Erro ao carregar variações', {
        description:
          error instanceof Error ? error.message : 'Erro desconhecido'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVariacoes()
  }, [pageIndex, pageSize, globalFilter])

  const columns: ColumnDef<Variacao>[] = [
    {
      accessorKey: 'imagens',
      header: 'Imagem',
      cell: ({ row }) => {
        const imagens = row.getValue('imagens') as string[] | undefined
        const imagem = imagens && imagens.length > 0 ? imagens[0] : undefined
        return (
          <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex items-center justify-center">
            {imagem ? (
              <img
                src={imagem}
                alt={row.getValue('descricaoComercial')}
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
      accessorKey: 'codigoVeiling',
      header: ({ column }) => (
        <HeaderColumnSorting column={column} content="Código" />
      ),
      cell: ({ row }) => {
        const codigo = row.getValue('codigoVeiling') as string
        return <div className="font-mono text-sm font-medium">{codigo}</div>
      }
    },
    {
      accessorKey: 'descricaoComercial',
      header: ({ column }) => (
        <HeaderColumnSorting column={column} content="Descrição" />
      ),
      cell: ({ row }) => {
        const descricao = row.getValue('descricaoComercial') as string
        return <div className="max-w-md truncate">{descricao}</div>
      }
    },
    {
      accessorKey: 'grupo.nome',
      header: 'Grupo',
      cell: ({ row }) => {
        const grupoNome = row.original.grupo?.nome
        return <div className="text-sm">{grupoNome}</div>
      }
    },
    {
      accessorKey: 'serie.nome',
      header: 'Série',
      cell: ({ row }) => {
        const serieNome = row.original.serie?.nome
        return <div className="text-sm">{serieNome}</div>
      }
    },
    {
      accessorKey: 'cor',
      header: 'Cor',
      cell: ({ row }) => {
        const cor = row.getValue('cor') as string | undefined
        const tingida = row.original.tingida
        return cor ? (
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-xs">
              {cor}
            </Badge>
            {tingida && (
              <Badge variant="secondary" className="text-xs">
                Tingida
              </Badge>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground text-xs">-</span>
        )
      }
    },
    {
      accessorKey: 'numeroPote',
      header: 'Pote',
      cell: ({ row }) => {
        const pote = row.getValue('numeroPote') as string | undefined
        return pote ? (
          <div className="text-sm">{pote}</div>
        ) : (
          <span className="text-muted-foreground text-xs">-</span>
        )
      }
    },
    {
      accessorKey: 'alturaCm',
      header: 'Altura',
      cell: ({ row }) => {
        const altura = row.getValue('alturaCm') as string | undefined
        return altura ? (
          <div className="text-sm">{altura} cm</div>
        ) : (
          <span className="text-muted-foreground text-xs">-</span>
        )
      }
    },
    {
      accessorKey: 'precoVendaSugerido',
      header: 'Preço',
      cell: ({ row }) => {
        const preco = row.getValue('precoVendaSugerido') as number
        return preco > 0 ? (
          <div className="text-sm font-medium text-green-600">
            R$ {(preco / 100).toFixed(2)}
          </div>
        ) : (
          <span className="text-muted-foreground text-xs">-</span>
        )
      }
    },
    {
      accessorKey: 'ativo',
      header: 'Status',
      cell: ({ row }) => {
        const ativo = row.getValue('ativo') as boolean
        return (
          <Badge variant={ativo ? 'default' : 'destructive'}>
            {ativo ? 'Ativo' : 'Inativo'}
          </Badge>
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
                router.push(`/cadastros/variacoes/${row.original.id}`)
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
                <Icon icon="box-isometric-tape" className="text-primary-500" />
                Variações de Produtos
              </CardTitle>
              <CardDescription>
                Gerencie as variações de flores e plantas
              </CardDescription>
            </div>
            <Button onClick={() => router.push('/cadastros/variacoes/novo')}>
              <Icon icon="plus" className="mr-2" />
              Nova Variação
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={variacoes}
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
