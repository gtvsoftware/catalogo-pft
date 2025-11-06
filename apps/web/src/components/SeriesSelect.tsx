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

export function SerieSelect() {
  const [series, setSeries] = useState<{ value: string; label: string }[]>([])
  const [loading, setLoading] = useState(false)

  const { control, watch } = useFormContext()

  const grupoSlug = watch('grupo')

  useEffect(() => {
    if (!grupoSlug) {
      setSeries([])
      return
    }

    async function fetchSeries() {
      setLoading(true)
      try {
        const res = await typesenseClient
          .collections('series')
          .documents()
          .search({
            q: '*',
            query_by: 'nome',
            filter_by: `grupoSlug:${grupoSlug}`,
            per_page: 250,
            sort_by: 'nome:asc'
          })

        const mapped = res.hits?.map((h: any) => ({
          value: h.document.slug,
          label: h.document.nome
        }))
        setSeries(mapped || [])
      } finally {
        setLoading(false)
      }
    }

    fetchSeries()
  }, [grupoSlug])

  return (
    <ComboboxFormField
      name="serie"
      control={control}
      comboboxProps={{
        options: series,
        placeholder: !grupoSlug
          ? 'Selecione um grupo primeiro'
          : loading
            ? 'Carregando séries...'
            : 'Selecione uma série',
        disabled: !grupoSlug || loading
      }}
    />
  )
}

interface Serie {
  id: string
  nome: string
  slug: string
}

interface SerieSelectProps {
  grupoId?: string
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
}

export function SerieSelectSimple({
  grupoId,
  value,
  onValueChange,
  disabled = false
}: SerieSelectProps) {
  const [series, setSeries] = useState<Serie[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!grupoId) {
      setSeries([])
      return
    }

    const fetchSeries = async () => {
      setLoading(true)
      try {
        const response = await fetch(
          `/api/series?grupoId=${grupoId}&limit=1000`
        )
        if (!response.ok) {
          throw new Error('Erro ao carregar séries')
        }
        const data = await response.json()
        setSeries(data.series || [])
      } catch (error) {
        console.error('Erro ao carregar séries:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSeries()
  }, [grupoId])

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled || !grupoId}
    >
      <SelectTrigger>
        <SelectValue
          placeholder={
            !grupoId
              ? 'Selecione um grupo primeiro'
              : loading
                ? 'Carregando...'
                : 'Selecione uma série'
          }
        />
      </SelectTrigger>
      <SelectContent>
        {series.map(serie => (
          <SelectItem key={serie.id} value={serie.id}>
            {serie.nome}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
