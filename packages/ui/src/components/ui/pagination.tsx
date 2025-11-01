import Link from 'next/link'
import * as React from 'react'

import { cn } from '../../utils'
import { Button, buttonVariants } from './button'
import { Icon } from './icon'

export type PaginationProps = {
  page?: number
  onChange?: (page: number) => void
  totalPages?: number
  total?: number
  showPreviousNext?: boolean
  isDisabled?: boolean
  className?: string
  children?: React.ReactNode
}

function Pagination({
  className,
  page,
  onChange,
  totalPages,
  showPreviousNext = true,
  isDisabled = false,
  children,
  ...props
}: PaginationProps) {
  const renderControlledPagination = () => {
    if (!totalPages || !onChange) return children

    const currentPage = page || 1
    const pages = []

    // Generate page numbers with ellipsis logic
    const getVisiblePages = () => {
      const delta = 2
      const range = []
      const rangeWithDots = []

      for (
        let i = Math.max(2, currentPage - delta);
        i <= Math.min(totalPages - 1, currentPage + delta);
        i++
      ) {
        range.push(i)
      }

      if (currentPage - delta > 2) {
        rangeWithDots.push(1, '...')
      } else {
        rangeWithDots.push(1)
      }

      rangeWithDots.push(...range)

      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push('...', totalPages)
      } else if (totalPages > 1) {
        rangeWithDots.push(totalPages)
      }

      return rangeWithDots
    }

    const visiblePages = getVisiblePages()

    return (
      <PaginationContent>
        {/* Previous Button */}
        {showPreviousNext && (
          <PaginationItem>
            <PaginationPrevious
              onClick={() =>
                !isDisabled && currentPage > 1 && onChange(currentPage - 1)
              }
              className={
                currentPage <= 1 || isDisabled
                  ? 'pointer-events-none opacity-50'
                  : ''
              }
              isDisabled={isDisabled}
            />
          </PaginationItem>
        )}

        {/* Page Numbers */}
        {visiblePages.map((pageNum, index) => (
          <PaginationItem key={index}>
            {pageNum === '...' ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                isActive={pageNum === currentPage}
                onClick={() => !isDisabled && onChange(pageNum as number)}
                isDisabled={isDisabled}
              >
                {pageNum}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        {/* Next Button */}
        {showPreviousNext && (
          <PaginationItem>
            <PaginationNext
              onClick={() =>
                !isDisabled &&
                currentPage < totalPages &&
                onChange(currentPage + 1)
              }
              className={
                currentPage >= totalPages || isDisabled
                  ? 'pointer-events-none opacity-50'
                  : ''
              }
              isDisabled={isDisabled}
            />
          </PaginationItem>
        )}
      </PaginationContent>
    )
  }

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn(
        'mx-auto flex w-full justify-center',
        isDisabled && 'opacity-50 pointer-events-none',
        className
      )}
      {...props}
    >
      {totalPages && onChange ? renderControlledPagination() : children}
    </nav>
  )
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn('flex flex-row items-center gap-1', className)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<'li'>) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
  isDisabled?: boolean
  href?: string
} & Pick<React.ComponentProps<typeof Button>, 'size'> & {
    children?: React.ReactNode
    className?: string
    onClick?: () => void
  }

function PaginationLink({
  className,
  isActive,
  isDisabled = false,
  size = 'default',
  href,
  children,
  onClick,
  ...props
}: PaginationLinkProps) {
  const baseClassName = cn(
    buttonVariants({
      variant: isActive ? 'outline' : 'ghost',
      size
    }),
    isDisabled && 'pointer-events-none opacity-50',
    className
  )

  if (href) {
    return (
      <Link href={href} className={baseClassName} {...props}>
        <span
          aria-current={isActive ? 'page' : undefined}
          aria-disabled={isDisabled}
          data-slot="pagination-link"
          data-active={isActive}
          data-disabled={isDisabled}
        >
          {children}
        </span>
      </Link>
    )
  }

  return (
    <button
      aria-current={isActive ? 'page' : undefined}
      aria-disabled={isDisabled}
      data-slot="pagination-link"
      data-active={isActive}
      data-disabled={isDisabled}
      className={baseClassName}
      onClick={onClick}
      type="button"
      disabled={isDisabled}
    >
      {children}
    </button>
  )
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Ir para a página anterior"
      size="default"
      className={cn('gap-1 px-2.5 sm:pl-2.5', className)}
      {...props}
    >
      <Icon icon="chevron-left" />
      <span className="hidden sm:block">Anterior</span>
    </PaginationLink>
  )
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Ir para a próxima página"
      size="default"
      className={cn('gap-1 px-2.5 sm:pr-2.5', className)}
      {...props}
    >
      <span className="hidden sm:block">Próxima</span>
      <Icon icon="chevron-right" />
    </PaginationLink>
  )
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn('flex size-9 items-center justify-center', className)}
      {...props}
    >
      <Icon icon="ellipsis" className="text-base" />
      <span className="sr-only">More pages</span>
    </span>
  )
}

// Helper function to generate page numbers for pagination
function generatePaginationRange(
  currentPage: number,
  totalPages: number
): (number | 'ellipsis')[] {
  const delta = 2 // Number of pages to show around current page
  const range: (number | 'ellipsis')[] = []

  if (totalPages <= 7) {
    // If we have 7 or fewer pages, show all
    for (let i = 1; i <= totalPages; i++) {
      range.push(i)
    }
  } else {
    // Always show first page
    range.push(1)

    if (currentPage - delta > 2) {
      range.push('ellipsis')
    }

    // Show pages around current page
    const start = Math.max(2, currentPage - delta)
    const end = Math.min(totalPages - 1, currentPage + delta)

    for (let i = start; i <= end; i++) {
      range.push(i)
    }

    if (currentPage + delta < totalPages - 1) {
      range.push('ellipsis')
    }

    // Always show last page
    if (totalPages > 1) {
      range.push(totalPages)
    }
  }

  return range
}

// Complete controlled pagination component
interface ControlledPaginationProps {
  total: number
  page: number
  onChange: (page: number) => void
  className?: string
}

function ControlledPagination({
  total,
  page,
  onChange,
  className
}: ControlledPaginationProps) {
  const pageRange = generatePaginationRange(page, total)

  if (total <= 1) {
    return null
  }

  return (
    <Pagination className={className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => {
              if (page > 1) {
                onChange(page - 1)
              }
            }}
            className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>

        {pageRange.map((pageNum, index) => (
          <PaginationItem key={index}>
            {pageNum === 'ellipsis' ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                onClick={() => {
                  onChange(pageNum)
                }}
                isActive={pageNum === page}
              >
                {pageNum}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            onClick={() => {
              if (page < total) {
                onChange(page + 1)
              }
            }}
            className={page >= total ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  ControlledPagination,
  type ControlledPaginationProps
}
