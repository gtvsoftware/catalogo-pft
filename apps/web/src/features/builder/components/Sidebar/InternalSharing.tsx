'use client'

import { IconButton } from '@terraviva/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@terraviva/ui/command'
import { Icon } from '@terraviva/ui/icon'
import { Label } from '@terraviva/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@terraviva/ui/popover'
import { useEffect, useState } from 'react'

import Avatar from '@/components/Avatar'
import { useCatalogBuilder } from '@/features/builder/providers/CatalogBuilderContext'

type Seller = {
  id: string
  name: string | null
  picture: string | null
}

export function InternalSharing() {
  const { formValues } = useCatalogBuilder()
  const [sellers, setSellers] = useState<Seller[]>([])
  const [selectedSellerId, setSelectedSellerId] = useState('')
  const [open, setOpen] = useState(false)

  const sharedWith = formValues.watch('sharedWith') || []

  useEffect(() => {
    let mounted = true

    const fetchSellers = async () => {
      try {
        const res = await fetch('/api/sellers')
        if (!res.ok) return
        const data = await res.json()

        if (mounted) setSellers(data || [])
      } catch (err) {
        console.error('Erro ao buscar sellers:', err)
      }
    }

    fetchSellers()

    return () => {
      mounted = false
    }
  }, [])

  const handleAddSeller = () => {
    if (!selectedSellerId) return

    const seller = sellers.find(s => s.id === selectedSellerId)
    if (!seller) return

    if (sharedWith.some(s => s.id === seller.id)) return

    formValues.setValue('sharedWith', [...sharedWith, seller])
    setSelectedSellerId('')
  }

  const handleRemoveSeller = (sellerId: string) => {
    formValues.setValue(
      'sharedWith',
      sharedWith.filter(s => s.id !== sellerId)
    )
  }

  const selectedSeller = sellers.find(s => s.id === selectedSellerId)

  const availableSellers = sellers.filter(
    s => !sharedWith.some(shared => shared.id === s.id)
  )

  return (
    <div className="space-y-4 pt-2 pb-4 px-4">
      <div>
        <Label className="text-sm mb-2 block">Compartilhar com</Label>
        <div className="flex gap-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex-1 flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-gray-50 text-left"
              >
                {selectedSeller ? (
                  <>
                    <Avatar image={selectedSeller.picture} />
                    <span className="truncate text-sm">
                      {selectedSeller.name || selectedSeller.id}
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-gray-500">
                    Selecione um vendedor
                  </span>
                )}
                <Icon
                  icon="angles-up-down"
                  className="ml-auto h-4 w-4 text-gray-500"
                />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0">
              <Command>
                <CommandInput
                  placeholder="Buscar vendedor..."
                  className="h-9"
                />
                <CommandList>
                  <CommandEmpty>Nenhum vendedor encontrado</CommandEmpty>
                  <CommandGroup>
                    {availableSellers.map(seller => (
                      <CommandItem
                        key={seller.id}
                        value={seller.id}
                        onSelect={() => {
                          setSelectedSellerId(seller.id)
                          setOpen(false)
                        }}
                        className="flex items-center gap-2"
                      >
                        <Avatar image={seller.picture} />
                        <span className="truncate">
                          {seller.name || seller.id}
                        </span>
                        <Icon
                          icon="check"
                          className={
                            selectedSellerId === seller.id
                              ? 'ml-auto opacity-100'
                              : 'ml-auto opacity-0'
                          }
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <IconButton
            icon="plus"
            onClick={handleAddSeller}
            disabled={!selectedSellerId}
            variant="outline"
            type="button"
            className="h-[50px] w-[50px]"
          />
        </div>
      </div>

      {sharedWith.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm">Compartilhado com:</Label>
          <div className="space-y-1">
            {sharedWith.map(seller => (
              <div
                key={seller.id}
                className="flex items-center gap-2 p-2 bg-gray-50 rounded-md group"
              >
                <Avatar image={seller.picture} />
                <span className="flex-1 text-sm truncate">
                  {seller.name || seller.id}
                </span>
                <IconButton
                  icon="xmark"
                  onClick={() => handleRemoveSeller(seller.id)}
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  type="button"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
