import { useEffect, useState } from 'react'
import { typesenseClient } from '@/services/typesense'
import { ComboboxFormField } from '@terraviva/ui/form-fields'
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
