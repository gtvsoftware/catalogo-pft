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
import { SelectAsync, type SelectAsyncProps } from '../ui/select-async'

interface SelectAsyncFormFieldProps<TFieldValues extends FieldValues, T>
  extends Omit<SelectAsyncProps<T>, 'label' | 'value' | 'onChange'> {
  control?: any
  name: Path<TFieldValues>
  label?: string
  description?: string
}

export function SelectAsyncFormField<TFieldValues extends FieldValues, T>({
  control,
  name,
  label,
  description,
  ...selectProps
}: SelectAsyncFormFieldProps<TFieldValues, T>) {
  const formContext = useFormContext()

  return (
    <FormField
      control={formContext?.control ?? control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <SelectAsync
              {...selectProps}
              label={label || ''}
              value={field.value || ''}
              onChange={field.onChange}
              triggerClassName={cn(
                selectProps.triggerClassName,
                fieldState.error &&
                  'border-destructive focus:border-destructive'
              )}
            />
          </FormControl>
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
