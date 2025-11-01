'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Matcher } from 'react-day-picker'

import { cn } from '../../utils'
import { Button } from './button'
import { Calendar } from './calendar'
import { Icon } from './icon'
import { Label } from './label'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

interface DatePickerProps {
  value: Date | undefined | null
  onChange: (date: Date | undefined | null) => void
  placeholder?: string
  label?: string
  disabled?: boolean
  helperText?: string
  minDate?: Matcher | Matcher[] | undefined
}

export default function DatePicker({
  value,
  onChange,
  placeholder,
  label,
  disabled = false,
  helperText,
  minDate
}: DatePickerProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <Label htmlFor="date" className="px-1">
          {label}
        </Label>
      )}
      <Popover>
        <PopoverTrigger asChild disabled={disabled}>
          <Button
            variant="outline"
            className={cn(
              'w-full flex flex-row items-center justify-start font-normal rounded-md',
              !value && 'text-muted-foreground'
            )}
          >
            <div className="flex flex-row gap-2 items-center">
              <Icon icon="calendar" className="h-4 w-4" />
              {value ? (
                format(value, 'dd/MM/yyyy')
              ) : (
                <span>{placeholder ?? 'Escolha uma data'}</span>
              )}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            locale={ptBR}
            mode="single"
            selected={value ?? undefined}
            onSelect={selected => onChange(selected)}
            autoFocus
            disabled={minDate}
          />
        </PopoverContent>
      </Popover>
      {helperText && (
        <Label htmlFor="date" className="px-1">
          {helperText}
        </Label>
      )}
    </div>
  )
}
