'use client'

import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useMediaQuery} from '../../hooks/use-media-query';

import { cn } from '../../utils'
import { Button } from './button'
import { Calendar } from './calendar'
import { DateInput } from './date-input'
import { Icon } from './icon'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './select'

export interface DateRange {
  from: Date
  to: Date | undefined
}

export interface DateRangePickerProps {
  value?: DateRange
  onValueChange?: (value: DateRange | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  align?: 'start' | 'center' | 'end'
  locale?: string
  fromDate?: Date
  toDate?: Date
}

interface Preset {
  name: string
  label: string
}

const PRESETS: Preset[] = [
  { name: 'today', label: 'Hoje' },
  { name: 'yesterday', label: 'Ontem' },
  { name: 'thisWeek', label: 'Esta semana' },
  { name: 'lastWeek', label: 'Semana passada' },
  { name: 'last7', label: 'Últimos 7 dias' },
  { name: 'last14', label: 'Últimos 14 dias' },
  { name: 'last30', label: 'Últimos 30 dias' },
  { name: 'thisMonth', label: 'Este mês' },
  { name: 'lastMonth', label: 'Mês passado' },
  { name: 'last3Months', label: 'Últimos 3 meses' }
]

const getPresetRange = (presetName: string): DateRange => {
  const now = new Date()
  const today = startOfDay(now)

  switch (presetName) {
    case 'today':
      return { from: today, to: endOfDay(now) }

    case 'yesterday': {
      const yesterday = subDays(today, 1)
      return { from: yesterday, to: endOfDay(yesterday) }
    }

    case 'thisWeek':
      return {
        from: startOfWeek(today, { locale: ptBR }),
        to: endOfDay(now)
      }

    case 'lastWeek': {
      const lastWeekStart = startOfWeek(subWeeks(today, 1), { locale: ptBR })
      const lastWeekEnd = endOfWeek(subWeeks(today, 1), { locale: ptBR })
      return { from: lastWeekStart, to: lastWeekEnd }
    }

    case 'last7':
      return { from: subDays(today, 6), to: endOfDay(now) }

    case 'last14':
      return { from: subDays(today, 13), to: endOfDay(now) }

    case 'last30':
      return { from: subDays(today, 29), to: endOfDay(now) }

    case 'thisMonth':
      return { from: startOfMonth(today), to: endOfDay(now) }

    case 'lastMonth': {
      const lastMonth = subMonths(today, 1)
      return {
        from: startOfMonth(lastMonth),
        to: endOfMonth(lastMonth)
      }
    }

    case 'last3Months':
      return { from: subMonths(today, 3), to: endOfDay(now) }

    default:
      return { from: today, to: endOfDay(now) }
  }
}

const formatDateRange = (range: DateRange): string => {
  if (!range.from) return ''

  const fromFormatted = format(range.from, 'dd/MM/yyyy')

  if (!range.to) return fromFormatted

  const toFormatted = format(range.to, 'dd/MM/yyyy')

  // If same date, show only once
  if (fromFormatted === toFormatted) {
    return fromFormatted
  }

  return `${fromFormatted} - ${toFormatted}`
}

const areRangesEqual = (a?: DateRange, b?: DateRange): boolean => {
  // Both are undefined/null
  if (!a && !b) return true
  // One is undefined/null, the other is not
  if (!a || !b) return false

  // Compare from dates
  if (a.from.getTime() !== b.from.getTime()) return false

  // Compare to dates
  if (!a.to && !b.to) return true
  if (!a.to || !b.to) return false

  return a.to.getTime() === b.to.getTime()
}

export function DateRangePicker({
  value,
  onValueChange,
  placeholder = 'Selecione o período',
  disabled = false,
  className,
  align = 'end',
  fromDate,
  toDate
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<string | undefined>()
  const isSmallScreen = useMediaQuery('(max-width: 768px)')
  const isMediumScreen = useMediaQuery('(min-width: 769px) and (max-width: 1024px)')
  const isLargeScreen = useMediaQuery('(min-width: 1025px) and (max-width: 1440px)')

  // Initialize with value if provided, otherwise use undefined
  const [range, setRange] = useState<DateRange | undefined>(() => {
    if (value?.from) {
      return {
        from: startOfDay(value.from),
        to: value.to ? endOfDay(value.to) : undefined
      }
    }
    return undefined
  })

  const openedRangeRef = useRef<DateRange | undefined>()

  // Update internal range when value prop changes
  useEffect(() => {
    if (value?.from) {
      const newRange = {
        from: startOfDay(value.from),
        to: value.to ? endOfDay(value.to) : undefined
      }
      setRange(newRange)
    } else {
      // Reset to undefined when value is cleared
      setRange(undefined)
    }
  }, [value])

  // Check which preset matches current range
  useEffect(() => {
    const matchingPreset = PRESETS.find(preset => {
      const presetRange = getPresetRange(preset.name)
      return areRangesEqual(range, presetRange)
    })
    setSelectedPreset(matchingPreset?.name)
  }, [range])

  // Store range when popover opens
  useEffect(() => {
    if (isOpen) {
      openedRangeRef.current = range
    }
  }, [isOpen, range])

  const handleRangeChange = useCallback(
    (newRange: DateRange) => {
      setRange(newRange)
      onValueChange?.(newRange)
    },
    [onValueChange]
  )

  const handlePresetSelect = useCallback((presetName: string) => {
    const presetRange = getPresetRange(presetName)
    setRange(presetRange)
    setSelectedPreset(presetName)
  }, [])

  const handleCalendarSelect = useCallback(
    (selected: { from?: Date; to?: Date } | undefined) => {
      if (!selected?.from) return

      const newRange: DateRange = {
        from: startOfDay(selected.from),
        to: selected.to ? endOfDay(selected.to) : undefined
      }

      setRange(newRange)
      setSelectedPreset(undefined) // Clear preset when manually selecting
    },
    []
  )

  const handleFromDateChange = useCallback(
    (date: Date) => {
      if (!range) {
        const newRange: DateRange = {
          from: startOfDay(date),
          to: endOfDay(date)
        }
        setRange(newRange)
      } else {
        const newRange: DateRange = {
          from: startOfDay(date),
          to: range.to && date <= range.to ? range.to : endOfDay(date)
        }
        setRange(newRange)
      }
      setSelectedPreset(undefined)
    },
    [range]
  )

  const handleToDateChange = useCallback(
    (date: Date) => {
      if (!range) {
        const newRange: DateRange = {
          from: startOfDay(date),
          to: endOfDay(date)
        }
        setRange(newRange)
      } else {
        const newRange: DateRange = {
          from: date < range.from ? startOfDay(date) : range.from,
          to: endOfDay(date)
        }
        setRange(newRange)
      }
      setSelectedPreset(undefined)
    },
    [range]
  )

  const handleApply = useCallback(() => {
    if (range) {
      handleRangeChange(range)
    }
    setIsOpen(false)
  }, [range, handleRangeChange])

  const handleCancel = useCallback(() => {
    if (openedRangeRef.current) {
      setRange(openedRangeRef.current)
    }
    setIsOpen(false)
  }, [])

  const handleClear = useCallback(() => {
    const today = new Date()
    const todayRange = {
      from: startOfDay(today),
      to: endOfDay(today)
    }
    setRange(todayRange)
    onValueChange?.(undefined)
    setSelectedPreset(undefined)
  }, [onValueChange])

  const displayValue = range?.from ? formatDateRange(range) : placeholder

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            disabled={disabled}
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !range?.from && 'text-muted-foreground'
            )}
            aria-label="Selecionar período de datas"
            isAutocomplete
          >
            <Icon icon="calendar-days" className="mr-2 h-4 w-4" />
            {range?.from ? formatDateRange(range) : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align={isSmallScreen ? 'center' : align}
          className={cn(
            'w-auto p-0',
            isSmallScreen && 'scale-75',
            isMediumScreen && 'scale-85 -ml-6',
            isLargeScreen && 'scale-90 -mt-6'
          )}
          onInteractOutside={() => {
            if (range && !areRangesEqual(range, openedRangeRef.current)) {
              handleRangeChange(range)
            }
          }}
        >
          <div className="flex flex-col sm:flex-row">
            {/* Presets sidebar */}
            {!isSmallScreen && (
              <div className="flex flex-col gap-1 p-3 border-r min-w-[160px]">
                <h4 className="font-medium text-sm mb-2">Períodos</h4>
                {PRESETS.map(preset => (
                  <Button
                    key={preset.name}
                    variant={
                      selectedPreset === preset.name ? 'default' : 'ghost'
                    }
                    size="sm"
                    className="justify-start text-sm"
                    onClick={() => handlePresetSelect(preset.name)}
                    rightIcon={
                      selectedPreset === preset.name ? 'check' : undefined
                    }
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            )}

            <div className="flex flex-col p-3 gap-3 " >
              {/* Mobile preset selector */}
              {isSmallScreen && (
                <Select
                  value={selectedPreset}
                  onValueChange={handlePresetSelect}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecionar período..." />
                  </SelectTrigger>
                  <SelectContent>
                    {PRESETS.map(preset => (
                      <SelectItem key={preset.name} value={preset.name}>
                        {preset.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Date inputs */}
              <div className="flex gap-2 items-end">
                <DateInput
                  value={range?.from}
                  onChange={handleFromDateChange}
                  fromDate={fromDate}
                  toDate={toDate}
                />
                <DateInput
                  value={range?.to}
                  onChange={handleToDateChange}
                  fromDate={range?.from}
                  toDate={toDate}
                />
              </div>

              {/* Calendar */}
              <div className="border rounded-md">
                <Calendar
                  showWeekNumber
                  className="p-3"
                  mode="range"
                  selected={
                    range ? { from: range.from, to: range.to } : undefined
                  }
                  onSelect={handleCalendarSelect}
                  locale={ptBR}
                  numberOfMonths={isSmallScreen ? 1 : 2}
                  defaultMonth={range?.from}
                  disabled={date => {
                    if (fromDate && date < fromDate) return true
                    if (toDate && date > toDate) return true
                    return false
                  }}
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={handleClear}>
                  Limpar
                </Button>
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button size="sm" onClick={handleApply}>
                  Aplicar
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

DateRangePicker.displayName = 'DateRangePicker'
