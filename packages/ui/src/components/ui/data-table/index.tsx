'use client'

import {
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
  type Updater,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import { useState } from 'react'

import { cn } from '../../../utils'
import { Button } from '../../ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '../../ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../../ui/table'
import { Icon } from '../icon'
import { DataTableInputFilter } from './input-filter'
import { DataTablePagination } from './pagination'

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export interface DataTableProps<T = any> {
  data: T[]
  totalCount?: number
  columns: ColumnDef<T>[]
  pageIndexValue?: number
  pageSizeValue?: number
  pageCountValue?: number
  sortingValue?: SortingState
  globalFilterValue?: string
  pageSizeOptions?: number[]
  manualFiltering?: boolean
  manualSorting?: boolean
  manualPagination?: boolean
  containerClassName?: string
  isLoading?: boolean
  onPageIndexChange?: (value: number) => void
  onPageSizeChange?: (value: number) => void
  onPageCountChange?: (value: number) => void
  onSortingChange?: (value: SortingState) => void
  onFilterChange?: (value: string) => void
  onPaginationChange?: (value: PaginationState) => void
  onGlobalFilterChange?: (value: string) => void

  hideColumnsButton?: boolean
  hideSearchBar?: boolean
  startHeaderElement?: React.ReactElement | false
  endHeaderElement?: React.ReactElement | false
  hideBorders?: boolean
}

export const DataTable = <DataType,>({
  data,
  totalCount = data.length,
  columns,
  pageIndexValue = 0,
  pageSizeValue = 10,
  pageCountValue = 1,
  sortingValue,
  globalFilterValue = '',
  pageSizeOptions = [5, 10, 15, 20, 25, 30],
  manualFiltering = true,
  manualSorting = true,
  manualPagination = true,
  containerClassName,
  isLoading,
  onPageIndexChange,
  onPageSizeChange,
  onPageCountChange,
  onSortingChange,
  onPaginationChange,
  onGlobalFilterChange,

  hideColumnsButton = false,
  hideSearchBar = false,
  hideBorders = false,
  startHeaderElement,
  endHeaderElement
}: DataTableProps<DataType>) => {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: pageIndexValue,
    pageSize: pageSizeValue
  })

  const handlePageCountChange = (value: number | string) => {
    onPageCountChange?.(Number(value))
  }

  const handleSortingChange = (old: Updater<SortingState>) => {
    const value = typeof old === 'function' ? old([]) : old

    onSortingChange?.(value)
  }

  const handlePaginationChange: OnChangeFn<PaginationState> = (
    old: Updater<PaginationState>
  ) => {
    const value = typeof old === 'function' ? old(pagination) : old

    setPagination(value)
    onPageIndexChange?.(value?.pageIndex)
    onPageSizeChange?.(value?.pageSize)
    onPaginationChange?.(value)
    handlePageCountChange(calcPageCount(value.pageSize))
  }

  const handleGlobalFilterChange = (value: string) => {
    onGlobalFilterChange?.(value)
  }

  const table = useReactTable({
    data,
    columns,
    onSortingChange: handleSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: handleGlobalFilterChange,
    onPaginationChange: handlePaginationChange,
    manualFiltering,
    manualSorting,
    manualPagination,
    pageCount: manualPagination
      ? pageCountValue
      : Math.ceil(data.length / pagination.pageSize),
    state: {
      pagination,
      sorting: sortingValue,
      columnVisibility,
      rowSelection,
      globalFilter: globalFilterValue
    }
  })

  const calcPageCount = (pageSize: number): number => {
    return manualPagination
      ? pageCountValue
      : Math.ceil(table.getFilteredRowModel().rows.length / pageSize)
  }

  return (
    <div className={cn('w-full', containerClassName)}>
      {(startHeaderElement ||
        !hideSearchBar ||
        !hideColumnsButton ||
        endHeaderElement) && (
        <div className="flex items-center justify-between py-4">
          {startHeaderElement}

          {!hideSearchBar && (
            <DataTableInputFilter
              table={table}
              globalFilterValue={globalFilterValue}
            />
          )}

          {!hideColumnsButton && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Colunas <Icon icon="angle-down" className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter(column => column.getCanHide())
                  .map(column => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value: boolean) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {endHeaderElement}
        </div>
      )}

      <div className={cn('rounded-md border', hideBorders && 'border-none')}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center relative"
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Icon
                      className="animate-spin text-primary-300 text-3xl"
                      icon="spinner-third"
                    />
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  className={cn(hideBorders && 'border-none')}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className="whitespace-nowrap">
                      {typeof cell.column.columnDef.cell === 'function'
                        ? cell.column.columnDef.cell?.(cell.getContext())
                        : cell.column.columnDef.cell}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Sem resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination
        pageSizeOptions={pageSizeOptions}
        manualPagination={manualPagination}
        totalCount={totalCount}
        table={table}
      />
    </div>
  )
}

export const HeaderColumnSorting = ({
  column,
  content,
  className
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
}: any) => {
  const sorting = column.getIsSorted()

  return (
    <Button
      variant="ghost"
      className={cn(
        'flex items-center justify-start gap-2 cursor-pointer hover:text-inherit hover:bg-inherit p-0',
        className
      )}
      onClick={() => column.toggleSorting(sorting === 'asc')}
    >
      <p className="whitespace-nowrap"> {content}</p>
      <Icon
        icon={
          sorting === 'asc'
            ? 'angle-down'
            : sorting === 'desc'
              ? 'angle-up'
              : 'angles-up-down'
        }
        className={cn(
          'h-4 w-4',
          (sorting === 'asc' || sorting === 'desc') && 'text-primary-500'
        )}
      />
    </Button>
  )
}
