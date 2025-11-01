import { useCallback, useEffect, useState } from 'react'

import { useDebounce } from '../../hooks/use-debounce'
import { cn } from '../../utils'
import { Button } from './button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from './command'
import { Icon } from './icon'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

export interface Option {
  value: string
  label: string
  disabled?: boolean
  description?: string
  icon?: React.ReactNode
}

export interface SelectAsyncProps<T> {
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
  /** Currently selected value */
  value: string
  /** Callback when selection changes */
  onChange: (value: string) => void
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
  /** Allow clearing the selection */
  clearable?: boolean
}

export function SelectAsync<T>({
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
  clearable = true
}: SelectAsyncProps<T>) {
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedValue, setSelectedValue] = useState(value)
  const [selectedOption, setSelectedOption] = useState<T | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, preload ? 0 : 300)
  const [originalOptions, setOriginalOptions] = useState<T[]>([])

  useEffect(() => {
    setMounted(true)
    setSelectedValue(value)
  }, [value])

  // Initialize selectedOption when options are loaded and value exists
  useEffect(() => {
    if (value && options.length > 0) {
      const option = options.find(opt => getOptionValue(opt) === value)
      if (option) {
        setSelectedOption(option)
      }
    }
  }, [value, options, getOptionValue])

  // Effect for initial fetch
  useEffect(() => {
    const initializeOptions = async () => {
      try {
        setLoading(true)
        setError(null)
        // If we have a value, use it for the initial search
        const data = await fetcher(value)
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
  }, [mounted, fetcher, value])
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

  const handleSelect = useCallback(
    (currentValue: string) => {
      const newValue =
        clearable && currentValue === selectedValue ? '' : currentValue
      setSelectedValue(newValue)
      setSelectedOption(
        options.find(option => getOptionValue(option) === newValue) || null
      )
      onChange(newValue)
      setOpen(false)
    },
    [selectedValue, onChange, clearable, options, getOptionValue]
  )
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          isAutocomplete
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'justify-between',
            disabled && 'opacity-50 cursor-not-allowed',
            triggerClassName
          )}
          style={{ width: '100%' }}
          disabled={disabled}
        >
          {selectedOption ? getDisplayValue(selectedOption) : placeholder}
          <Icon icon="angles-up-down" className="opacity-50 text-xs" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-(--radix-popover-trigger-width)">
        <Command shouldFilter={false}>
          <div className="relative border-b w-full">
            <CommandInput
              placeholder={`Buscar ${label.toLowerCase()}...`}
              value={searchTerm}
              onValueChange={value => {
                setSearchTerm(value)
              }}
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
              {options.map(option => (
                <CommandItem
                  key={getOptionValue(option)}
                  value={getOptionValue(option)}
                  onSelect={handleSelect}
                >
                  {renderOption(option)}
                  <Icon
                    icon="check"
                    className={cn(
                      'ml-auto h-3 w-3 text-xs',
                      selectedValue === getOptionValue(option)
                        ? 'opacity-100'
                        : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
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
