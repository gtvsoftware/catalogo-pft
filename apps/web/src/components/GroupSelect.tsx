'use client'

import { typesenseClient } from '@terraviva/typesense-catalogo-pft'
import { ComboboxFormField } from '@terraviva/ui/form-fields'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@terraviva/ui/select'
import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'

export function GrupoSelect() {
  const [grupos, setGrupos] = useState<{ value: string; label: string }[]>([])
  const [loading, setLoading] = useState(true)

  const { control, setValue, watch } = useFormContext()

  async function fetchGrupos() {
    const res = await typesenseClient.collections('grupos').documents().search({
      q: '*',
      query_by: 'nome',
      per_page: 250,
      sort_by: 'nome:asc'
    })

    return res.hits?.map((h: any) => ({
      value: h.document.slug,
      label: h.document.nome
    }))
  }

  useEffect(() => {
    fetchGrupos().then(data => {
      setGrupos(data || [])
      setLoading(false)
    })
  }, [])

  const grupo = watch('grupo')

  useEffect(() => {
    setValue('serie', null)
  }, [grupo])

  return (
    <ComboboxFormField
      name="grupo"
      control={control}
      comboboxProps={{
        options: grupos,
        placeholder: loading ? 'Carregando...' : 'Selecione um grupo'
      }}
    />
  )
}

interface Grupo {
  id: string
  nome: string
  slug: string
}

interface GroupSelectProps {
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
}

export function GroupSelect({
  value,
  onValueChange,
  disabled = false
}: GroupSelectProps) {
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGrupos = async () => {
      try {
        const response = await fetch('/api/grupos?limit=1000')
        if (!response.ok) {
          throw new Error('Erro ao carregar grupos')
        }
        const data = await response.json()
        setGrupos(data.grupos || [])
      } catch (error) {
        console.error('Erro ao carregar grupos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGrupos()
  }, [])

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue
          placeholder={loading ? 'Carregando...' : 'Selecione um grupo'}
        />
      </SelectTrigger>
      <SelectContent>
        {grupos.map(grupo => (
          <SelectItem key={grupo.id} value={grupo.id}>
            {grupo.nome}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
