import { toast } from '@terraviva/ui/sonner'
import { useCallback, useEffect, useRef, useState } from 'react'

function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(this, args), delay)
  }
}

interface AutoSaveOptions {
  delay?: number 
  onSave: () => Promise<void>
  enabled?: boolean
}

export function useAutoSave({
  delay = 2000,
  onSave,
  enabled = true
}: AutoSaveOptions) {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const debouncedSaveRef = useRef<(() => void) | null>(null)

  
  useEffect(() => {
    const saveFunction = async () => {
      if (!enabled) return

      try {
        setIsSaving(true)
        await onSave()
        setLastSaved(new Date())
        toast.success('Salvo automaticamente', {
          duration: 2000
        })
      } catch (error) {
        console.error('Auto-save error:', error)
        toast.error('Erro ao salvar automaticamente')
      } finally {
        setIsSaving(false)
      }
    }

    debouncedSaveRef.current = debounce(saveFunction, delay)
  }, [onSave, delay, enabled])

  const triggerSave = useCallback(() => {
    if (!enabled) return
    debouncedSaveRef.current?.()
  }, [enabled])

  return {
    isSaving,
    lastSaved,
    triggerSave
  }
}
