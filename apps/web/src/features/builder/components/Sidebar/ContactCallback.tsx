import { cn } from '@terraviva/ui/cn'
import { Input } from '@terraviva/ui/input'
import { Label } from '@terraviva/ui/label'
import { toast } from '@terraviva/ui/sonner'
import { useEffect, useRef, useState } from 'react'
import { IMask } from 'react-imask'

import { useCatalogBuilder } from '../../providers/CatalogBuilderContext'

export function ContactCallback() {
  const { formValues } = useCatalogBuilder()

  const phoneContact = formValues.watch('phoneContact')

  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [localPhoneContact, setLocalPhoneContact] = useState(phoneContact || '')

  const phoneInputRef = useRef<HTMLInputElement>(null)
  const phoneTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const skipPhoneSyncRef = useRef(false)
  const maskInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (phoneContact !== undefined && !skipPhoneSyncRef.current) {
      setLocalPhoneContact(phoneContact)
      if (maskInstanceRef.current) {
        maskInstanceRef.current.value = phoneContact
      }
    }
    skipPhoneSyncRef.current = false
  }, [phoneContact])

  useEffect(() => {
    return () => {
      if (phoneTimeoutRef.current) {
        clearTimeout(phoneTimeoutRef.current)
      }
    }
  }, [])

  const handlePhoneChange = (value: string) => {
    setLocalPhoneContact(value)

    if (phoneError) {
      setPhoneError(null)
    }

    if (phoneTimeoutRef.current) {
      clearTimeout(phoneTimeoutRef.current)
    }
  }

  useEffect(() => {
    if (phoneInputRef.current) {
      const maskInstance = IMask(phoneInputRef.current, {
        mask: [
          {
            mask: '(00)0000-0000',
            lazy: false
          },
          {
            mask: '(00)00000-0000',
            lazy: false
          }
        ],
        dispatch: function (appended, dynamicMasked) {
          const number = (dynamicMasked.value + appended).replace(/\D/g, '')

          return number.length > 10
            ? dynamicMasked.compiledMasks[1]
            : dynamicMasked.compiledMasks[0]
        }
      })

      maskInstanceRef.current = maskInstance

      maskInstance.on('accept', () => {
        handlePhoneChange(maskInstance.value)
      })

      return () => {
        maskInstance.destroy()
        maskInstanceRef.current = null
      }
    }
  }, [])

  const handlePhoneBlur = () => {
    if (phoneTimeoutRef.current) {
      clearTimeout(phoneTimeoutRef.current)
    }

    const cleanPhone = localPhoneContact.replace(/\D/g, '')

    if (cleanPhone.length === 0) {
      setPhoneError(null)
      skipPhoneSyncRef.current = true
      formValues.setValue('phoneContact', '')
      return
    }

    if (cleanPhone.length === 10 || cleanPhone.length === 11) {
      skipPhoneSyncRef.current = true
      formValues.setValue('phoneContact', localPhoneContact)
      setPhoneError(null)
    } else {
      setPhoneError(
        'Número de telefone inválido. Use (00)0000-0000 ou (00)00000-0000'
      )
      toast.error('Número de telefone inválido')
    }
  }

  return (
    <div className="space-y-4 pt-2 pb-4 px-4">
      <div>
        <Label htmlFor="phoneContact" className="text-sm">
          Telefone de Contato *
        </Label>
        <Input
          ref={phoneInputRef}
          id="phoneContact"
          type="tel"
          defaultValue={localPhoneContact}
          onBlur={handlePhoneBlur}
          placeholder="(00)00000-0000"
          className={cn('text-sm', phoneError && 'border-red-500')}
        />
        {phoneError ? (
          <p className="text-xs text-red-500 mt-1">{phoneError}</p>
        ) : (
          <p className="text-xs text-gray-500 mt-1">
            Clientes usarão este número para fazer pedidos
          </p>
        )}
      </div>
    </div>
  )
}
