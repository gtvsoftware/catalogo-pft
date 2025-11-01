import {
  type Control,
  type FieldValues,
  type Path,
  useFormContext
} from 'react-hook-form'

import { cn } from '../../utils'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '../ui/form'
import { SimpleEditor } from '../ui/tiptap/tiptap-templates/simple/simple-editor'

interface TipTapEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  disabled?: boolean
}

interface SimpleEditorFormFieldProps<TFieldValues extends FieldValues>
  extends Omit<TipTapEditorProps, 'content' | 'onChange'> {
  control?: Control
  name: Path<TFieldValues>
  label?: string
  description?: string
  className?: string
}

export function SimpleEditorFormField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  placeholder = 'Digite aqui...',
  disabled = false,
  ...editorProps
}: SimpleEditorFormFieldProps<TFieldValues>) {
  const { control: formContextControl } = useFormContext()

  return (
    <FormField
      control={control ?? formContextControl}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={cn('space-y-2', className)}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <div
              className={cn(
                'rounded-md border border-input overflow-hidden',
                fieldState.error &&
                  'border-destructive focus-within:border-destructive',
                disabled && 'opacity-50'
              )}
            >
              <SimpleEditor
                {...editorProps}
                content={field.value || ''}
                onChange={field.onChange}
                placeholder={placeholder}
                disabled={disabled}
              />
            </div>
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
