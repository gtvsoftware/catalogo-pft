import { ComboboxFormField } from '@terraviva/ui/form-fields'
import { useEffect, useState } from 'react'

import { typesenseClient } from '@/services/typesense'
import { useFormContext } from 'react-hook-form'

export function GrupoSelect() {
  const [grupos, setGrupos] = useState<{ value: string; label: string }[]>([])
  const [loading, setLoading] = useState(true)

  const { control } = useFormContext()

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
