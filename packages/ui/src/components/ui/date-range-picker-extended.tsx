'use client'

import { ptBR } from 'date-fns/locale'
import { useEffect, useRef, useState } from 'react'

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

export interface DateRangePickerExtendedProps {
  onValueChange?: (values: DateRange) => void
  align?: 'start' | 'center' | 'end'
  locale?: string
  placeholder?: string
  icon?: string
  iconVariant?: any
  iconFamily?: any
  iconClassName?: string
  disabled?: boolean
  label?: string
  value?: any
}

const formatDate = (date: Date, locale: string = 'pt-br'): string => {
  return date.toLocaleDateString(locale)
}

const getDateAdjustedForTimezone = (dateInput: Date | string): Date => {
  if (typeof dateInput === 'string') {
    const parts = dateInput.split('-').map(part => parseInt(part, 10))
    const date = new Date(parts[0]!, parts[1]! - 1, parts[2])
    return date
  } else {
    return dateInput
  }
}

interface DateRange {
  inicio: Date
  fim: Date | undefined
}

interface Preset {
  name: string
  label: string
}

const PRESETS: Preset[] = [
  { name: 'today', label: 'Hoje' },
  { name: 'thisWeek', label: 'Essa semana' },
  { name: 'last7', label: 'Últimos 7 dias' },
  { name: 'last14', label: 'Últimos 14 dias' },
  { name: 'lastEightWeeks', label: 'Últimas 8 semanas' },
  { name: 'last30', label: 'Últimos 30 dias' },
  { name: 'thisMonth', label: 'Esse mês' }
]

export function DateRangePickerExtended({
  label,
  disabled,
  value,
  iconClassName,
  onValueChange,
  align = 'end',
  locale = 'pt-BR'
}: DateRangePickerExtendedProps) {
  const [isOpen, setIsOpen] = useState(false)

  const [range, setRange] = useState<DateRange>({
    inicio: getDateAdjustedForTimezone(
      value?.inicio
        ? new Date(new Date(value.inicio).setHours(0, 0, 0, 0))
        : new Date(new Date().setHours(0, 0, 0, 0))
    ),
    fim: getDateAdjustedForTimezone(
      value?.fim
        ? new Date(new Date(value.fim).setHours(0, 0, 0, 0))
        : new Date(new Date().setHours(0, 0, 0, 0))
    )
  })

  useEffect(() => {
    if (value) {
      setRange({
        inicio: getDateAdjustedForTimezone(
          new Date(new Date(value.inicio).setHours(0, 0, 0, 0))
        ),
        fim: getDateAdjustedForTimezone(
          new Date(new Date(value.fim).setHours(0, 0, 0, 0))
        )
      })
    }
  }, [value])

  const handleValueChange = (currentValue: DateRange) => {
    onValueChange?.(currentValue)
    setIsOpen(false)
  }

  const openedRangeRef = useRef<DateRange | undefined>()

  const [selectedPreset, setSelectedPreset] = useState<string | undefined>(
    undefined
  )

  const [isSmallScreen, setIsSmallScreen] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 960 : false
  )

  useEffect(() => {
    const handleResize = (): void => {
      setIsSmallScreen(window.innerWidth < 960)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const getPresetRange = (presetName: string): DateRange => {
    const preset = PRESETS.find(({ name }) => name === presetName)
    if (!preset) throw new Error(`Unknown date range preset: ${presetName}`)
    const from = new Date()
    const to = new Date()
    const first = from.getDate() - from.getDay()

    switch (preset.name) {
      case 'today':
        from.setHours(0, 0, 0, 0)
        to.setHours(23, 59, 59, 999)
        break
      case 'yesterday':
        from.setDate(from.getDate() - 1)
        from.setHours(0, 0, 0, 0)
        to.setDate(to.getDate() - 1)
        to.setHours(23, 59, 59, 999)
        break
      case 'last7':
        from.setDate(from.getDate() - 6)
        from.setHours(0, 0, 0, 0)
        to.setHours(23, 59, 59, 999)
        break
      case 'last14':
        from.setDate(from.getDate() - 13)
        from.setHours(0, 0, 0, 0)
        to.setHours(23, 59, 59, 999)
        break
      case 'last30':
        from.setDate(from.getDate() - 29)
        from.setHours(0, 0, 0, 0)
        to.setHours(23, 59, 59, 999)
        break
      case 'thisWeek':
        from.setDate(first)
        from.setHours(0, 0, 0, 0)
        to.setHours(23, 59, 59, 999)
        break
      case 'lastWeek':
        from.setDate(from.getDate() - 7 - from.getDay())
        to.setDate(to.getDate() - to.getDay() - 1)
        from.setHours(0, 0, 0, 0)
        to.setHours(23, 59, 59, 999)
        break
      case 'lastEightWeeks':
        from.setDate(from.getDate() - 56 - from.getDay())
        to.setDate(to.getDate() - to.getDay() - 1)
        from.setHours(0, 0, 0, 0)
        to.setHours(23, 59, 59, 999)
        break
      case 'thisMonth':
        from.setDate(1)
        from.setHours(0, 0, 0, 0)
        to.setHours(23, 59, 59, 999)
        break
      case 'lastMonth':
        from.setMonth(from.getMonth() - 1)
        from.setDate(1)
        from.setHours(0, 0, 0, 0)
        to.setDate(0)
        to.setHours(23, 59, 59, 999)
        break
    }

    return { inicio: from, fim: to }
  }

  const setPreset = (preset: string): void => {
    const range = getPresetRange(preset)
    setRange(range)
  }

  const checkPreset = (): void => {
    for (const preset of PRESETS) {
      const presetRange = getPresetRange(preset.name)

      const normalizedRangeFrom = new Date(range.inicio)
      normalizedRangeFrom.setHours(0, 0, 0, 0)
      const normalizedPresetFrom = new Date(
        presetRange.inicio.setHours(0, 0, 0, 0)
      )

      const normalizedRangeTo = new Date(range.fim ?? 0)
      normalizedRangeTo.setHours(0, 0, 0, 0)
      const normalizedPresetTo = new Date(
        presetRange.fim?.setHours(0, 0, 0, 0) ?? 0
      )

      if (
        normalizedRangeFrom.getTime() === normalizedPresetFrom.getTime() &&
        normalizedRangeTo.getTime() === normalizedPresetTo.getTime()
      ) {
        setSelectedPreset(preset.name)
        return
      }
    }

    setSelectedPreset(undefined)
  }

  const areRangesEqual = (a?: DateRange, b?: DateRange): boolean => {
    if (!a || !b) return a === b
    return (
      a.inicio.getTime() === b.inicio.getTime() &&
      (!a.fim || !b.fim || a.fim.getTime() === b.fim.getTime())
    )
  }

  const reset = () => {
    handleValueChange({
      inicio: getDateAdjustedForTimezone(
        new Date(new Date().setHours(0, 0, 0, 0))
      ),
      fim: getDateAdjustedForTimezone(new Date(new Date().setHours(0, 0, 0, 0)))
    })
    setRange({
      inicio: getDateAdjustedForTimezone(
        new Date(new Date().setHours(0, 0, 0, 0))
      ),
      fim: getDateAdjustedForTimezone(new Date(new Date().setHours(0, 0, 0, 0)))
    })
  }

  useEffect(() => {
    checkPreset()
  }, [range])

  useEffect(() => {
    if (isOpen) openedRangeRef.current = range
  }, [isOpen])

  useEffect(() => {
    if (!value) reset()
  }, [value])

  return (
    <div className="flex flex-col justify-center items-start gap-1 w-full">
      <p className="text-gray-600 text-xs font-bold uppercase text-nowrap flex gap-1 items-center justify-center">
        {label}
      </p>
      <Popover
        modal={true}
        open={isOpen}
        onOpenChange={(open: boolean) => {
          setIsOpen(open)
        }}
      >
        <PopoverTrigger>
          <Button
            disabled={disabled}
            size={'lg'}
            variant="outline"
            className="justify-between p-3 px-2 w-full"
            isAutocomplete
          >
            <div className="flex gap-3 items-center">
              <Icon
                icon="calendar-days"
                family="duotone"
                className={cn('text-gray-800', iconClassName)}
              />
              {`${formatDate(range.inicio, locale)}${
                range.fim != null ? ' - ' + formatDate(range.fim, locale) : ''
              }`}
            </div>
            <div className="transition-transform">
              <Icon icon="chevron-down" className="text-gray-600 text-xs" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          onInteractOutside={() => {
            if (!areRangesEqual(range, openedRangeRef.current)) {
              handleValueChange?.({ ...range })
            }
          }}
          align={align as 'end' | 'center' | 'start' | undefined}
          className="w-max"
        >
          <div className="flex gap-2">
            {!isSmallScreen && (
              <div className="flex w-44 h-16 flex-col gap-2 mt-4">
                {PRESETS.map(preset => (
                  <Button
                    key={preset.name}
                    className={cn(
                      'w-full text-start justify-between p-2 border',
                      selectedPreset === preset.name &&
                        'pointer-events-none bg-primary-500 text-white font-bold'
                    )}
                    variant="ghost"
                    onClick={() => {
                      setPreset(preset.name)
                    }}
                    rightIcon={
                      selectedPreset === preset.name ? 'check' : undefined
                    }
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-2 justify-start items-center">
              {isSmallScreen && (
                <Select
                  defaultValue={selectedPreset}
                  onValueChange={value => {
                    setPreset(value)
                  }}
                >
                  <SelectTrigger className="w-full mb-2">
                    <SelectValue placeholder="Outros..." />
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

              <div className="flex w-full items-end gap-4">
                <DateInput
                  value={range.inicio}
                  onChange={date => {
                    const toDate =
                      range.fim == null || date > range.fim ? date : range.fim
                    setRange(prevRange => ({
                      ...prevRange,
                      inicio: date,
                      fim: toDate
                    }))
                  }}
                />
                <DateInput
                  value={range.fim}
                  onChange={date => {
                    const fromDate = date < range.inicio ? date : range.inicio
                    setRange(prevRange => ({
                      ...prevRange,
                      inicio: fromDate,
                      fim: date
                    }))
                  }}
                />

                <Button
                  onClick={() => {
                    setIsOpen(false)
                    if (!areRangesEqual(range, openedRangeRef.current)) {
                      handleValueChange?.({ ...range })
                    }
                  }}
                >
                  Concluir
                </Button>
              </div>

              <div className="w-full h-full border rounded-md flex flex-col gap-2">
                <Calendar
                  className="p-4"
                  mode="range"
                  showWeekNumber
                  onSelect={(value: { from?: Date; to?: Date } | undefined) => {
                    if (value?.from != null) {
                      setRange({ inicio: value.from, fim: value?.to })
                    }
                  }}
                  selected={{ from: range.inicio, to: range.fim }}
                  locale={ptBR}
                  showYearSwitcher={false}
                  numberOfMonths={isSmallScreen ? 1 : 2}
                  defaultMonth={
                    new Date(
                      new Date().setMonth(
                        new Date().getMonth() - (isSmallScreen ? 0 : 1)
                      )
                    )
                  }
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

DateRangePickerExtended.displayName = 'DateRangePickerExtended'
