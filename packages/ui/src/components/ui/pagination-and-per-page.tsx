import * as React from 'react'

import { cn } from '../../utils'
import { Pagination } from './pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './select'

export interface PaginationAndPerPageProps {
  /**
   * Current page number (1-indexed)
   */
  page: number
  /**
   * Total number of pages
   */
  totalPages: number
  /**
   * Current items per page
   */
  perPage: number
  /**
   * Callback when page changes
   */
  onPageChange: (page: number) => void
  /**
   * Callback when per page changes
   */
  onPerPageChange: (perPage: number) => void
  /**
   * Available per page options
   * @default [10, 20, 30, 50, 100]
   */
  perPageOptions?: number[]
  /**
   * Whether to show the per page selector
   * @default true
   */
  showPerPageSelector?: boolean
  /**
   * Label for the per page selector
   * @default "Itens por página:"
   */
  perPageLabel?: string
  /**
   * Whether the component is disabled
   * @default false
   */
  isDisabled?: boolean
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Whether to show previous/next buttons
   * @default true
   */
  showPreviousNext?: boolean
}

export function PaginationAndPerPage({
  page,
  totalPages,
  perPage,
  onPageChange,
  onPerPageChange,
  perPageOptions = [10, 20, 30, 50, 100],
  showPerPageSelector = true,
  perPageLabel = 'Itens por página:',
  isDisabled = false,
  className,
  showPreviousNext = true
}: PaginationAndPerPageProps) {
  const handlePerPageChange = React.useCallback(
    (value: string) => {
      const newPerPage = parseInt(value, 10)
      if (!isNaN(newPerPage)) {
        onPerPageChange(newPerPage)
      }
    },
    [onPerPageChange]
  )

  return (
    <div
      className={cn(
        'flex flex-col md:flex-row items-center justify-between gap-4 ',
        isDisabled && 'opacity-50 pointer-events-none',
        className
      )}
    >
      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onChange={onPageChange}
          showPreviousNext={showPreviousNext}
          isDisabled={isDisabled}
          className='!mx-0 w-auto'
        />
      )}
         {/* Per Page Selector */}
      {showPerPageSelector && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {perPageLabel}
          </span>
          <Select
            value={String(perPage)}
            onValueChange={handlePerPageChange}
            disabled={isDisabled}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {perPageOptions.map(option => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

    </div>
  )
}
