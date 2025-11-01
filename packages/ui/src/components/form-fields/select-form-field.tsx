import { type FieldValues, type Path, useFormContext } from 'react-hook-form'

import { cn } from '../../utils'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '../ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select'

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectFormFieldProps<TFieldValues extends FieldValues>
  extends Omit<
    React.ComponentProps<typeof SelectTrigger>,
    'value' | 'onChange' | 'children'
  > {
  control?: any
  name: Path<TFieldValues>
  label?: string
  description?: string
  placeholder?: string
  options: SelectOption[]
  triggerClassName?: string
  contentClassName?: string
  disabled?: boolean
  required?: boolean
  onValueChange?: (value: string) => void
}

export function SelectFormField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder = 'Select an option...',
  options,
  triggerClassName,
  contentClassName,
  disabled,
  required,
  onValueChange,
  size,
  ...triggerProps
}: SelectFormFieldProps<TFieldValues>) {
  const formContext = useFormContext()

  return (
    <FormField
      control={formContext?.control ?? control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          {label && (
            <FormLabel>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
          )}
          <Select
            value={field.value || ''}
            onValueChange={value => {
              field.onChange(value)
              onValueChange?.(value)
            }}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger
                {...triggerProps}
                size={size}
                className={cn(
                  triggerClassName,
                  fieldState.error &&
                    'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20'
                )}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent
              className={cn('max-h-64 overflow-y-auto', contentClassName)}
            >
              {options.map(option => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldState.error ? (
            <FormMessage>{fieldState.error.message}</FormMessage>
          ) : (
            description && <FormDescription>{description}</FormDescription>
          )}
        </FormItem>
      )}
    />
  )
}
