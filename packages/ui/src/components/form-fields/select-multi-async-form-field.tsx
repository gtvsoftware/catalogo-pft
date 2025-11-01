import { type FieldValues, type Path, useFormContext } from 'react-hook-form'

import { cn } from '../../utils'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '../ui/form'
import {
  MultiSelectAsync,
  type MultiSelectAsyncProps
} from './select-multi-field'

interface MultiSelectAsyncFormFieldProps<TFieldValues extends FieldValues, T>
  extends Omit<MultiSelectAsyncProps<T>, 'label' | 'value' | 'onChange'> {
  control?: any
  name: Path<TFieldValues>
  label?: string
  description?: string
  useFormProps?: any
}

export function MultiSelectAsyncFormField<TFieldValues extends FieldValues, T>({
  control,
  name,
  label,
  description,
  useFormProps,
  ...selectProps
}: MultiSelectAsyncFormFieldProps<TFieldValues, T>) {
  const formContext = useFormContext()

  return (
    <Form {...useFormProps}>
      <FormField
        control={formContext?.control ?? control}
        name={name}
        render={({ field, fieldState }) => (
          <FormItem>
            {label && <FormLabel>{label}</FormLabel>}
            <FormControl>
              <MultiSelectAsync
                {...selectProps}
                label={label || ''}
                value={field.value || []}
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
    </Form>
  )
}
