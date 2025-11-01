import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon
} from '@radix-ui/react-icons'
import type { Table } from '@tanstack/react-table'

import { Button } from '../../ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../ui/select'

interface DataTablePaginationProps<TData> {
  table: Table<TData>
  totalCount: number
  manualPagination?: boolean
  pageSizeOptions: number[]
}

export function DataTablePagination<TData>({
  table,
  totalCount,
  manualPagination,
  pageSizeOptions
}: DataTablePaginationProps<TData>) {
  return (
    <div className="grid items-start grid-cols-[1fr_1fr_1fr] py-4">
      <div className="text-sm text-muted-foreground whitespace-nowrap">
        {table.getRowModel().rows.length} {' de '}
        {!manualPagination
          ? table.getFilteredRowModel().rows.length
          : totalCount}
        {' itens'}
      </div>

      <div className="flex flex-col items-center justify-center gap-2">
        <div className="flex items-center justify-center">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Ir para primeira página</span>
            <DoubleArrowLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Ir para página anterior</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Ir para próxima página</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Ir para ultíma página</span>
            <DoubleArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center justify-center text-sm font-medium whitespace-nowrap">
          Página {table.getState().pagination.pageIndex + 1} {' de '}
          {table.getPageCount()}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 space-x-2 whitespace-nowrap">
        <p className="text-sm font-medium whitespace-nowrap">
          Itens por página
        </p>
        <Select
          value={`${table.getState().pagination.pageSize}`}
          onValueChange={value => {
            table.setPageSize(Number(value))
          }}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={table.getState().pagination.pageSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {pageSizeOptions.map(pageSize => (
              <SelectItem key={pageSize} value={`${pageSize}`}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
