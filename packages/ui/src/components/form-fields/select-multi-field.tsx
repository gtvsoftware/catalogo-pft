import { useCallback, useEffect, useState } from 'react'

import { useDebounce } from '../../hooks/use-debounce'
import { cn } from '../../utils'
import { Button } from '../ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '../ui/command'
import { Icon } from '../ui/icon'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'

export interface MultiSelectAsyncProps<T> {
  /** Async function to fetch options */
  fetcher: (query?: string) => Promise<T[]>
  /** Preload all data ahead of time */
  preload?: boolean
  /** Function to filter options */
  filterFn?: (option: T, query: string) => boolean
  /** Function to render each option */
  renderOption: (option: T) => React.ReactNode
  /** Function to get the value from an option */
  getOptionValue: (option: T) => string
  /** Function to get the display value for the selected option */
  getDisplayValue: (option: T) => React.ReactNode
  /** Custom not found message */
  notFound?: React.ReactNode
  /** Custom loading skeleton */
  loadingSkeleton?: React.ReactNode
  /** Currently selected values */
  value: string[]
  /** Callback when selection changes */
  onChange: (value: string[]) => void
  /** Label for the select field */
  label: string
  /** Placeholder text when no selection */
  placeholder?: string
  /** Disable the entire select */
  disabled?: boolean
  /** Custom width for the popover */
  width?: string | number
  /** Custom class names */
  className?: string
  /** Custom trigger button class names */
  triggerClassName?: string
  /** Custom no results message */
  noResultsMessage?: string
  /** Custom render for selected values in the trigger */
  renderTriggerValue?: (selectedOptions: T[]) => React.ReactNode
}

export function MultiSelectAsync<T>({
  fetcher,
  preload,
  filterFn,
  renderOption,
  getOptionValue,
  getDisplayValue,
  notFound,
  loadingSkeleton,
  label,
  placeholder = 'Select...',
  value,
  onChange,
  disabled = false,
  className,
  triggerClassName,
  noResultsMessage,
  renderTriggerValue
}: MultiSelectAsyncProps<T>) {
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, preload ? 0 : 300)
  const [originalOptions, setOriginalOptions] = useState<T[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Effect for initial fetch
  useEffect(() => {
    const initializeOptions = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetcher()
        setOriginalOptions(data)
        setOptions(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch options')
      } finally {
        setLoading(false)
      }
    }
    if (!mounted) {
      initializeOptions()
    }
  }, [mounted, fetcher])

  // Effect for fetching/searching
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetcher(debouncedSearchTerm)
        setOriginalOptions(data)
        setOptions(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch options')
      } finally {
        setLoading(false)
      }
    }

    if (!mounted) {
      fetchOptions()
    } else if (!preload) {
      fetchOptions()
    } else if (preload) {
      if (debouncedSearchTerm) {
        setOptions(
          originalOptions.filter(option =>
            filterFn ? filterFn(option, debouncedSearchTerm) : true
          )
        )
      } else {
        setOptions(originalOptions)
      }
    }
  }, [fetcher, debouncedSearchTerm, mounted, preload, filterFn])

  const handleToggle = useCallback(
    (currentValue: string) => {
      let newValues: string[]
      if (value.includes(currentValue)) {
        newValues = value.filter(v => v !== currentValue)
      } else {
        newValues = [...value, currentValue]
      }
      onChange(newValues)
    },
    [value, onChange]
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button
          isAutocomplete
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'justify-between h-auto',
            disabled && 'opacity-50 cursor-not-allowed',
            triggerClassName
          )}
          style={{ width: '100%' }}
          disabled={disabled}
        >
          {value.length > 0
            ? renderTriggerValue
              ? renderTriggerValue(
                  options.filter(opt => value.includes(getOptionValue(opt)))
                )
              : `${value.length} selecionado(s)`
            : placeholder}

          <Icon icon="angles-up-down" className="opacity-50 text-xs" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-(--radix-popover-trigger-width)">
        <Command shouldFilter={false}>
          <div className="relative border-b w-full">
            <CommandInput
              placeholder={`Buscar ${label.toLowerCase()}...`}
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="!outline-hidden !border-none"
            />
            {loading && options.length > 0 && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center">
                <Icon
                  icon="spinner-third"
                  className="h-4 w-4 animate-spin text-xs"
                />
              </div>
            )}
          </div>
          <CommandList>
            {error && (
              <div className="p-4 text-destructive text-center">{error}</div>
            )}
            {loading &&
              options.length === 0 &&
              (loadingSkeleton || <DefaultLoadingSkeleton />)}
            {!loading &&
              !error &&
              options.length === 0 &&
              (notFound || (
                <CommandEmpty>
                  {noResultsMessage ?? `No ${label.toLowerCase()} found.`}
                </CommandEmpty>
              ))}
            <CommandGroup>
              {options.map(option => {
                const optionValue = getOptionValue(option)
                const isSelected = value.includes(optionValue)
                return (
                  <CommandItem
                    key={optionValue}
                    value={optionValue}
                    onSelect={() => handleToggle(optionValue)}
                  >
                    {renderOption(option)}
                    <Icon
                      icon="check"
                      className={cn(
                        'mr-auto h-3 w-3 text-xs',
                        isSelected ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function DefaultLoadingSkeleton() {
  return (
    <CommandGroup>
      {[1, 2, 3].map(i => (
        <CommandItem key={i} disabled>
          <div className="flex items-center gap-2 w-full">
            <div className="h-6 w-6 rounded-full animate-pulse bg-muted" />
            <div className="flex flex-col flex-1 gap-1">
              <div className="h-4 w-24 animate-pulse bg-muted rounded" />
              <div className="h-3 w-16 animate-pulse bg-muted rounded" />
            </div>
          </div>
        </CommandItem>
      ))}
    </CommandGroup>
  )
}
