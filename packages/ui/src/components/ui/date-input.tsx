import { isValid } from 'date-fns'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { cn } from '../../utils'
import { Icon } from './icon'

interface DateInputProps {
  value?: Date
  onChange: (date: Date) => void
  fromDate?: Date
  toDate?: Date
  error?: boolean
  className?: string
}

interface DateParts {
  day: string
  month: string
  year: string
}

const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  fromDate,
  toDate,
  error = false,
  className
}) => {
  const [date, setDate] = useState<DateParts>(() => {
    if (value && isValid(value)) {
      return {
        day: value.getDate().toString(),
        month: (value.getMonth() + 1).toString(),
        year: value.getFullYear().toString()
      }
    }
    return { day: '', month: '', year: '' }
  })

  const [hasError, setHasError] = useState(false)
  const dayRef = useRef<HTMLInputElement | null>(null)
  const monthRef = useRef<HTMLInputElement | null>(null)
  const yearRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (value && isValid(value)) {
      setDate({
        day: value.getDate().toString(),
        month: (value.getMonth() + 1).toString(),
        year: value.getFullYear().toString()
      })
      setHasError(false)
    }
  }, [value])

  const validateAndCreateDate = useCallback(
    (parts: DateParts): Date | null => {
      const day = parseInt(parts.day, 10) || 0
      const month = parseInt(parts.month, 10) || 0
      const year = parseInt(parts.year, 10) || 0

      if (
        day < 1 ||
        day > 31 ||
        month < 1 ||
        month > 12 ||
        year < 1000 ||
        year > 9999
      ) {
        return null
      }

      const newDate = new Date(year, month - 1, day)

      // Check if the date is valid (handles cases like Feb 30)
      if (
        newDate.getFullYear() !== year ||
        newDate.getMonth() + 1 !== month ||
        newDate.getDate() !== day
      ) {
        return null
      }

      // Check min/max constraints
      if (fromDate && newDate < fromDate) return null
      if (toDate && newDate > toDate) return null

      return newDate
    },
    [fromDate, toDate]
  )

  const handleInputChange =
    (field: keyof DateParts) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/\D/g, '') // Only allow digits

      // Limit input length based on field
      const maxLength = field === 'year' ? 4 : 2
      const limitedValue = value.slice(0, maxLength)

      const newDate = { ...date, [field]: limitedValue }
      setDate(newDate)

      // Auto-advance to next field only when:
      // 1. Field is full (2 digits for day/month)
      // 2. OR the value is definitely complete (e.g., day > 3 means can't be 10-31)
      if (field === 'day' && limitedValue.length === 2) {
        const dayNum = parseInt(limitedValue)
        if (dayNum >= 1 && dayNum <= 31) {
          monthRef.current?.focus()
        }
      } else if (field === 'month' && limitedValue.length === 2) {
        const monthNum = parseInt(limitedValue)
        if (monthNum >= 1 && monthNum <= 12) {
          yearRef.current?.focus()
        }
      }

      // Validate complete date
      if (newDate.day && newDate.month && newDate.year.length === 4) {
        const validDate = validateAndCreateDate(newDate)
        if (validDate) {
          onChange(validDate)
          setHasError(false)
        } else {
          setHasError(true)
        }
      }
    }

  const handleKeyDown =
    (field: keyof DateParts) => (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowRight' || e.key === '/') {
        e.preventDefault()
        if (field === 'day') monthRef.current?.focus()
        else if (field === 'month') yearRef.current?.focus()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        if (field === 'month') dayRef.current?.focus()
        else if (field === 'year') monthRef.current?.focus()
      } else if (
        e.key === 'Backspace' &&
        e.currentTarget.selectionStart === 0
      ) {
        e.preventDefault()
        if (field === 'month') dayRef.current?.focus()
        else if (field === 'year') monthRef.current?.focus()
      }
    }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text')
    const dateMatch = pastedText.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/)

    if (dateMatch) {
      const [, day, month, year] = dateMatch
      if (day && month && year) {
        const newDate = {
          day: day,
          month: month,
          year
        }

        const validDate = validateAndCreateDate(newDate)
        if (validDate) {
          setDate(newDate)
          onChange(validDate)
          setHasError(false)
        }
      }
    }
  }

  return (
    <div className={cn('flex flex-col w-full', className)}>
      <div
        className={cn(
          'flex border rounded-md items-center justify-start text-sm p-2 transition-colors',
          hasError || error
            ? 'border-destructive bg-destructive/10'
            : 'border-input hover:border-accent-foreground/25 focus-within:border-ring',
          'focus-within:ring-1 focus-within:ring-ring/20'
        )}
      >
        <Icon
          icon="calendar-days"
          className="mr-2 h-4 w-4 text-muted-foreground shrink-0"
        />
        <div className="flex items-center gap-1">
          <input
            ref={dayRef}
            type="text"
            inputMode="numeric"
            maxLength={2}
            value={date.day}
            onChange={handleInputChange('day')}
            onKeyDown={handleKeyDown('day')}
            onPaste={handlePaste}
            onFocus={e => e.target.select()}
            className="p-0 outline-hidden w-6 border-none text-center bg-transparent"
            placeholder="DD"
            aria-label="Dia"
          />
          <span className="text-muted-foreground">/</span>
          <input
            ref={monthRef}
            type="text"
            inputMode="numeric"
            maxLength={2}
            value={date.month}
            onChange={handleInputChange('month')}
            onKeyDown={handleKeyDown('month')}
            onPaste={handlePaste}
            onFocus={e => e.target.select()}
            className="p-0 outline-hidden w-6 border-none text-center bg-transparent"
            placeholder="MM"
            aria-label="Mês"
          />
          <span className="text-muted-foreground">/</span>
          <input
            ref={yearRef}
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={date.year}
            onChange={handleInputChange('year')}
            onKeyDown={handleKeyDown('year')}
            onPaste={handlePaste}
            onFocus={e => e.target.select()}
            className="p-0 outline-hidden w-12 border-none text-center bg-transparent"
            placeholder="AAAA"
            aria-label="Ano"
          />
        </div>
      </div>
      {hasError && (
        <p className="text-destructive text-xs mt-1">Data inválida</p>
      )}
    </div>
  )
}

DateInput.displayName = 'DateInput'

export { DateInput }
